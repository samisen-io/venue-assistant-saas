import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(_request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data, error } = await (auth.supabase as any)
      .from("venue_event_types")
      .select("*")
      .eq("venue_id", venueId)
      .order("created_at", { ascending: true })
    if (error) throw error
    return NextResponse.json(data ?? [])
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
    const eventTypes = Array.isArray(body.eventTypes) ? body.eventTypes : []

    const { error: delError } = await (auth.supabase as any)
      .from("venue_event_types")
      .delete()
      .eq("venue_id", venueId)
    if (delError) throw delError

    if (!eventTypes.length) return NextResponse.json([])

    const rows = eventTypes.map((t: any) => ({
      venue_id: venueId,
      event_type_key: t.event_type_key,
      event_type_label: t.event_type_label,
      is_custom: Boolean(t.is_custom),
    }))

    const { data, error } = await (auth.supabase as any)
      .from("venue_event_types")
      .insert(rows)
      .select("*")
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}
