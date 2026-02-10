import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(_request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data, error } = await (auth.supabase as any)
      .from("venue_ai_settings")
      .select("*")
      .eq("venue_id", venueId)
      .maybeSingle()
    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()

    const { data: existing } = await (auth.supabase as any)
      .from("venue_ai_settings")
      .select("id")
      .eq("venue_id", venueId)
      .maybeSingle()

    if (existing?.id) {
      const { data, error } = await (auth.supabase as any)
        .from("venue_ai_settings")
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("*")
        .single()
      if (error) throw error
      return NextResponse.json(data)
    }

    const { data, error } = await (auth.supabase as any)
      .from("venue_ai_settings")
      .insert({ venue_id: venueId, ...body })
      .select("*")
      .single()
    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}
