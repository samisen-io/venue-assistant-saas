import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { supabase } = auth

    // Get last 10 published versions
    const versionsRes = await (supabase as any)
      .from("venue_page_versions")
      .select("id, published_at, published_by, version_number")
      .eq("venue_id", venueId)
      .order("published_at", { ascending: false })
      .limit(10)

    if (versionsRes.error) {
      return NextResponse.json(
        { error: "Failed to load versions" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      versions: versionsRes.data || [],
    })
  } catch (error) {
    console.error("Get versions error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load versions" },
      { status: 500 }
    )
  }
}
