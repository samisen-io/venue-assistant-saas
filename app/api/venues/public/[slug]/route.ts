import { NextResponse } from "next/server"
import { fetchVenuePublicPageData } from "@/lib/public-page/fetchPublicVenue"

function sanitizeVenueForPublicApi(venue: Record<string, unknown>) {
  const sanitized = { ...venue }
  delete sanitized.owner_id
  delete sanitized.privacy_settings
  delete sanitized.google_analytics_id
  delete sanitized.facebook_pixel_id
  return sanitized
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const data = await fetchVenuePublicPageData({ slug, publishedOnly: true })
    if (!data) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...data,
      venue: sanitizeVenueForPublicApi(data.venue as Record<string, unknown>),
    }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    })
  } catch (error) {
    console.error("Error fetching public venue data:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
