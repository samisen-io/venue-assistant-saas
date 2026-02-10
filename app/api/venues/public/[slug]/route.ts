import { NextResponse } from "next/server"
import { fetchVenuePublicPageData } from "@/lib/public-page/fetchPublicVenue"

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

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    })
  } catch (error) {
    console.error("Error fetching public venue data:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
