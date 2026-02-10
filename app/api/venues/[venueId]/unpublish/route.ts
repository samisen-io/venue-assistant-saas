import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { supabase } = auth

    // Update venue status to unpublished
    const res = await (supabase as any)
      .from("venues")
      .update({ page_status: "unpublished" })
      .eq("id", venueId)
      .select()
      .single()

    if (res.error) {
      return NextResponse.json(
        { error: "Failed to unpublish page" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Page unpublished successfully",
    })
  } catch (error) {
    console.error("Unpublish error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to unpublish page" },
      { status: 500 }
    )
  }
}
