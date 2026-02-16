import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

const RESULTS_PER_PAGE = 12

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Parse query parameters
    const location = searchParams.get("location")?.trim() || ""
    const eventType = searchParams.get("event_type")?.trim() || ""
    const guestCount = parseInt(searchParams.get("guests") || "0", 10) || 0
    const venueType = searchParams.get("venue_type")?.trim() || ""
    const amenities = searchParams.get("amenities")?.split(",").filter(Boolean) || []
    const sort = searchParams.get("sort") || "relevance"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServiceRoleClient() as any

    // Build the query for venues
    let query = supabase
      .from("venues")
      .select(
        `
        id, name, slug, city, state, venue_type, tagline, hero_image_url,
        view_count, inquiry_count, description,
        venue_public_settings!inner(featured, is_visible_on_marketplace),
        venue_event_types(event_type_key),
        venue_packages(base_price),
        venue_amenities(amenity_key),
        spaces(capacity)
      `,
        { count: "exact" }
      )
      .eq("page_status", "published")
      .eq("venue_public_settings.is_visible_on_marketplace", true)

    // Location filter (city or state, case-insensitive)
    if (location) {
      query = query.or(
        `city.ilike.%${location}%,state.ilike.%${location}%,zip_code.ilike.%${location}%`
      )
    }

    // Venue type filter
    if (venueType) {
      query = query.ilike("venue_type", `%${venueType}%`)
    }

    // Note: capacity is on spaces table, filtered post-query

    // Sorting
    switch (sort) {
      case "price_asc":
        // No direct price column on venues; sort by view_count as fallback
        query = query.order("view_count", { ascending: true, nullsFirst: false })
        break
      case "price_desc":
        query = query.order("view_count", { ascending: false, nullsFirst: false })
        break
      case "capacity":
        query = query.order("capacity", { ascending: false, nullsFirst: false })
        break
      case "newest":
        query = query.order("created_at", { ascending: false })
        break
      case "relevance":
      default:
        query = query.order("view_count", { ascending: false, nullsFirst: false })
        break
    }

    // Pagination
    const from = (page - 1) * RESULTS_PER_PAGE
    const to = from + RESULTS_PER_PAGE - 1
    query = query.range(from, to)

    const { data: venues, error, count } = await query

    if (error) {
      console.error("Search query error:", error)
      return NextResponse.json(
        { error: "Failed to search venues" },
        { status: 500 }
      )
    }

    // Post-filter: event type (checked against related venue_event_types)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filtered = venues || []
    if (eventType) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.filter((v: any) =>
        (v.venue_event_types || []).some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (et: any) =>
            et.event_type_key?.toLowerCase().includes(eventType.toLowerCase())
        )
      )
    }

    // Post-filter: amenities (checked against related venue_amenities)
    if (amenities.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.filter((v: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const venueAmenities = (v.venue_amenities || []).map((a: any) =>
          a.amenity_key?.toLowerCase()
        )
        return amenities.every((a) =>
          venueAmenities.some((va: string) => va?.includes(a.toLowerCase()))
        )
      })
    }

    // Post-filter: guest count (capacity is on spaces table)
    if (guestCount > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.filter((v: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maxCapacity = Math.max(0, ...(v.spaces || []).map((s: any) => s.capacity || 0))
        return maxCapacity >= guestCount
      })
    }

    // Map to response shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = filtered.map((v: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maxCapacity = (v.spaces || []).length > 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? Math.max(...(v.spaces as any[]).map((s: any) => s.capacity || 0))
        : null
      return {
      id: v.id,
      name: v.name,
      slug: v.slug,
      city: v.city,
      state: v.state,
      venue_type: v.venue_type,
      tagline: v.tagline,
      hero_image_url: v.hero_image_url,
      capacity: maxCapacity,
      view_count: v.view_count,
      description: v.description
        ? v.description.substring(0, 200)
        : null,
      event_types: (v.venue_event_types || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (et: any) => et.event_type_key as string
      ),
      amenities: (v.venue_amenities || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any) => a.amenity_key as string
      ),
      starting_price:
        v.venue_packages && v.venue_packages.length > 0
          ? Math.min(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...v.venue_packages.map((p: any) => p.base_price).filter(Boolean)
            )
          : null,
      featured: v.venue_public_settings?.featured ?? false,
    }})

    // Log search query for analytics (fire-and-forget)
    supabase
      .from("venue_search_queries")
      .insert({
        query_text: location || null,
        location: location || null,
        event_type: eventType || null,
        guest_count: guestCount || null,
        results_count: count || 0,
        session_id: request.headers.get("x-session-id") || null,
      })
      .then(() => {})

    return NextResponse.json(
      {
        venues: results,
        total: count || 0,
        page,
        per_page: RESULTS_PER_PAGE,
        total_pages: Math.ceil((count || 0) / RESULTS_PER_PAGE),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    )
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
