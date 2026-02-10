import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(_request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const [settingsRes, blackoutRes] = await Promise.all([
      (auth.supabase as any).from("venue_calendar_settings").select("*").eq("venue_id", venueId).maybeSingle(),
      (auth.supabase as any).from("venue_blackout_dates").select("*").eq("venue_id", venueId).order("start_date", { ascending: true }),
    ])

    return NextResponse.json({
      calendarSettings: settingsRes.data ?? null,
      blackoutDates: blackoutRes.data ?? [],
    })
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
    const settings = body.calendarSettings || {}
    const blackoutDates = Array.isArray(body.blackoutDates) ? body.blackoutDates : []

    const { data: existing } = await (auth.supabase as any)
      .from("venue_calendar_settings")
      .select("id")
      .eq("venue_id", venueId)
      .maybeSingle()

    if (existing?.id) {
      const { error } = await (auth.supabase as any)
        .from("venue_calendar_settings")
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
      if (error) throw error
    } else {
      const { error } = await (auth.supabase as any)
        .from("venue_calendar_settings")
        .insert({ venue_id: venueId, ...settings })
      if (error) throw error
    }

    const { error: deleteError } = await (auth.supabase as any)
      .from("venue_blackout_dates")
      .delete()
      .eq("venue_id", venueId)
    if (deleteError) throw deleteError

    if (blackoutDates.length > 0) {
      const rows = blackoutDates.map((b: any) => ({
        venue_id: venueId,
        start_date: b.start_date,
        end_date: b.end_date,
        reason: b.reason || null,
      }))
      const { error: insertError } = await (auth.supabase as any)
        .from("venue_blackout_dates")
        .insert(rows)
      if (insertError) throw insertError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}
