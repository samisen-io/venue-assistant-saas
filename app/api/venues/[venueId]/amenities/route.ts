import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(_request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data, error } = await (auth.supabase as any)
      .from("venue_amenities")
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
    const amenities = Array.isArray(body.amenities) ? body.amenities : []

    const { error: delError } = await (auth.supabase as any)
      .from("venue_amenities")
      .delete()
      .eq("venue_id", venueId)
    if (delError) throw delError

    if (!amenities.length) return NextResponse.json([])

    const rows = amenities.map((a: any) => ({
      venue_id: venueId,
      amenity_key: a.amenity_key,
      amenity_label: a.amenity_label,
      is_custom: Boolean(a.is_custom),
      extra_info: a.extra_info || null,
    }))

    const { data, error } = await (auth.supabase as any)
      .from("venue_amenities")
      .insert(rows)
      .select("*")
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}
