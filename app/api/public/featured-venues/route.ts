import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export const revalidate = 300 // Cache for 5 minutes

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServiceRoleClient() as any

    const { data: venues, error } = await supabase
      .from("venues")
      .select(`
        id, name, slug, city, state, venue_type, tagline, hero_image_url,
        view_count, inquiry_count, capacity,
        venue_public_settings!inner(featured, is_visible_on_marketplace),
        venue_event_types(event_type),
        venue_packages(price)
      `)
      .eq("page_status", "published")
      .eq("venue_public_settings.is_visible_on_marketplace", true)
      .order("view_count", { ascending: false, nullsFirst: false })
      .limit(8)

    if (error) {
      console.error("Error fetching featured venues:", error)
      return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = (venues || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      city: v.city,
      state: v.state,
      venue_type: v.venue_type,
      tagline: v.tagline,
      hero_image_url: v.hero_image_url,
      capacity: v.capacity,
      view_count: v.view_count,
      event_types: (v.venue_event_types || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (et: any) => et.event_type as string
      ),
      starting_price:
        v.venue_packages && v.venue_packages.length > 0
          ? Math.min(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...v.venue_packages.map((p: any) => p.price).filter(Boolean)
            )
          : null,
      featured: v.venue_public_settings?.featured ?? false,
    }))

    return NextResponse.json(mapped, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Featured venues API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
