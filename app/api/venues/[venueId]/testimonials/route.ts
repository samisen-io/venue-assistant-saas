import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(_request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data, error } = await (auth.supabase as any)
      .from("venue_testimonials")
      .select("*")
      .eq("venue_id", venueId)
      .order("display_order", { ascending: true })
    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { data, error } = await (auth.supabase as any)
      .from("venue_testimonials")
      .insert({
        venue_id: venueId,
        client_name: body.client_name,
        client_company: body.client_company || null,
        event_type: body.event_type || null,
        quote: body.quote,
        star_rating: body.star_rating ?? null,
        client_photo_url: body.client_photo_url || null,
        event_date: body.event_date || null,
        is_published: body.is_published ?? false,
        display_order: body.display_order ?? 0,
        source: body.source || "manual",
      })
      .select("*")
      .single()
    if (error) throw error

    return NextResponse.json(data, { status: 201 })
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
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const { id, ...fields } = body
    const { data, error } = await (auth.supabase as any)
      .from("venue_testimonials")
      .update(fields)
      .eq("id", id)
      .eq("venue_id", venueId)
      .select("*")
      .single()
    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const { error } = await (auth.supabase as any)
      .from("venue_testimonials")
      .delete()
      .eq("id", id)
      .eq("venue_id", venueId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}
