import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { askClaudeForJSON } from "@/lib/ai/claude"
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/utils/rateLimit"

const RESULTS_PER_PAGE = 12

interface AISearchExtraction {
  location: string | null
  event_types: string[]
  venue_type: string | null
  min_guests: number | null
  amenities: string[]
  keywords: string[]
  search_summary: string
}

const AI_SEARCH_SYSTEM_PROMPT = `You extract structured search parameters from natural language venue search queries. Output valid JSON only.

Known venue types: banquet_hall, hotel, resort, conference_center, outdoor_garden, rooftop, ballroom, restaurant, barn, estate, winery, museum, loft
Known event types: wedding, corporate, party, conference, gala, birthday, meeting, reception, workshop, celebration, cocktail, rehearsal_dinner, anniversary, fundraiser, holiday_party, seminar, trade_show
Known amenities: parking, wifi, av_system, catering_kitchen, bar_area, outdoor_space, accessible, green_room, dance_floor, stage, climate_control, photo_area

Rules:
- Extract ONLY what is explicitly stated or strongly implied. Use null for unmentioned fields.
- For location, extract city AND/OR state name. Do not guess locations.
- For guest count, extract the number mentioned. "intimate" = 50, "large" = 200+.
- For keywords, extract style/vibe words: rustic, elegant, modern, intimate, industrial, vintage, bohemian, classic, luxury, etc.
- search_summary: a concise, friendly sentence describing the search (max 15 words).
- Map informal terms: "outdoor" = outdoor_garden, "fancy hotel" = hotel, "barn" = resort (closest match).`

function buildExtractionPrompt(query: string): string {
  return `Extract search parameters from this venue search query:

"${query}"

Respond with JSON matching this schema:
{
  "location": string | null,
  "event_types": string[],
  "venue_type": string | null,
  "min_guests": number | null,
  "amenities": string[],
  "keywords": string[],
  "search_summary": string
}`
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit
    const ip = getClientIp(request)
    const rl = checkRateLimit(ip, RATE_LIMITS.ai)
    if (!rl.success) return rateLimitResponse(rl)

    // 2. Parse request body
    const body = await request.json()
    const query = body.query?.trim()
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }
    if (query.length > 500) {
      return NextResponse.json({ error: "Query too long" }, { status: 400 })
    }

    const page = Math.max(1, parseInt(body.page || "1", 10))

    // 3. Extract structured parameters via Claude
    let extraction: AISearchExtraction
    try {
      extraction = await askClaudeForJSON<AISearchExtraction>(
        buildExtractionPrompt(query),
        {
          systemPrompt: AI_SEARCH_SYSTEM_PROMPT,
          maxTokens: 300,
        }
      )
    } catch (aiError) {
      console.error("AI extraction failed, falling back:", aiError)
      return fallbackSearch(query, page, request)
    }

    // 4. Query Supabase using extracted parameters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServiceRoleClient() as any

    let dbQuery = supabase
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

    // Apply extracted filters
    if (extraction.location) {
      dbQuery = dbQuery.or(
        `city.ilike.%${extraction.location}%,state.ilike.%${extraction.location}%`
      )
    }
    // Note: venue_type is intentionally NOT filtered at DB level here.
    // Many venues are categorised as "hotel" or "banquet_hall" but describe
    // themselves as "rooftop", "barn", etc. in their name/description.
    // We include the extracted venue_type as a keyword so those venues are found.

    // Note: capacity is on spaces table, filtered post-query

    // Keyword search on name/description — includes extracted venue_type so that
    // e.g. "rooftop" finds "Skyline Rooftop Austin" even if its venue_type is "hotel".
    const searchTerms = [
      ...extraction.keywords,
      ...(extraction.venue_type ? [extraction.venue_type.replace(/_/g, " ")] : []),
    ]
    if (searchTerms.length > 0) {
      const keywordFilter = searchTerms
        .map((k) => `name.ilike.%${k}%,description.ilike.%${k}%,tagline.ilike.%${k}%`)
        .join(",")
      dbQuery = dbQuery.or(keywordFilter)
    }

    dbQuery = dbQuery.order("view_count", {
      ascending: false,
      nullsFirst: false,
    })

    const from = (page - 1) * RESULTS_PER_PAGE
    const to = from + RESULTS_PER_PAGE - 1
    dbQuery = dbQuery.range(from, to)

    const { data: venues, error, count } = await dbQuery

    if (error) {
      console.error("AI search query error:", error)
      return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }

    // 5. Post-filter: event types and amenities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filtered = venues || []
    if (extraction.event_types.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.filter((v: any) => {
        const types = v.venue_event_types || []
        // If venue has no event types listed, include it — don't penalise incomplete data.
        if (types.length === 0) return true
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return types.some((et: any) =>
          extraction.event_types.some((t) =>
            et.event_type_key?.toLowerCase().includes(t.toLowerCase())
          )
        )
      })
    }
    if (extraction.amenities.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.filter((v: any) => {
        const venueAmenities = (v.venue_amenities || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any) => a.amenity_key?.toLowerCase()
        )
        return extraction.amenities.some((a) =>
          venueAmenities.some((va: string) => va?.includes(a.toLowerCase()))
        )
      })
    }

    // Post-filter: guest count (capacity is on spaces table)
    if (extraction.min_guests && extraction.min_guests > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.filter((v: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maxCapacity = Math.max(0, ...(v.spaces || []).map((s: any) => s.capacity || 0))
        return maxCapacity >= extraction.min_guests!
      })
    }

    // 6. Map to response shape (same as existing search API)
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
      description: v.description ? v.description.substring(0, 200) : null,
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

    // 7. Log for analytics (fire-and-forget)
    supabase
      .from("venue_search_queries")
      .insert({
        query_text: query,
        location: extraction.location || null,
        event_type: extraction.event_types.join(",") || null,
        guest_count: extraction.min_guests || null,
        filters: extraction,
        results_count: results.length,
        session_id: request.headers.get("x-session-id") || null,
      })
      .then(() => {})

    return NextResponse.json({
      venues: results,
      total: count || 0,
      page,
      per_page: RESULTS_PER_PAGE,
      total_pages: Math.ceil((count || 0) / RESULTS_PER_PAGE),
      ai_summary: extraction.search_summary,
      extracted_filters: {
        location: extraction.location,
        event_types: extraction.event_types,
        venue_type: extraction.venue_type,
        min_guests: extraction.min_guests,
        amenities: extraction.amenities,
        keywords: extraction.keywords,
      },
    })
  } catch (error) {
    console.error("AI Search API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function fallbackSearch(
  query: string,
  page: number,
  request: NextRequest
) {
  try {
    const params = new URLSearchParams({
      location: query,
      page: String(page),
    })
    const url = new URL(
      `/api/public/venues/search?${params}`,
      request.nextUrl.origin
    )
    const res = await fetch(url, {
      headers: {
        "x-session-id": request.headers.get("x-session-id") || "",
      },
    })
    const data = await res.json()
    return NextResponse.json({
      ...data,
      ai_summary: null,
      extracted_filters: null,
      fallback: true,
    })
  } catch {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}
