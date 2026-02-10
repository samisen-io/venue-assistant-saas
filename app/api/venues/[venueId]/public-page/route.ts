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

    const { supabase, venue } = auth

    const [
      spacesRes,
      amenitiesRes,
      eventTypesRes,
      packagesRes,
      addonsRes,
      photosRes,
      testimonialsRes,
      calendarSettingsRes,
      blackoutDatesRes,
      aiSettingsRes,
    ] = await Promise.all([
      (supabase as any).from("spaces").select("*").eq("venue_id", venueId).order("display_order", { ascending: true }),
      (supabase as any).from("venue_amenities").select("*").eq("venue_id", venueId).order("created_at", { ascending: true }),
      (supabase as any).from("venue_event_types").select("*").eq("venue_id", venueId).order("created_at", { ascending: true }),
      (supabase as any).from("venue_packages").select("*").eq("venue_id", venueId).order("display_order", { ascending: true }),
      (supabase as any).from("venue_package_addons").select("*").eq("venue_id", venueId).order("created_at", { ascending: true }),
      (supabase as any).from("venue_photos").select("*").eq("venue_id", venueId).order("display_order", { ascending: true }),
      (supabase as any).from("venue_testimonials").select("*").eq("venue_id", venueId).order("display_order", { ascending: true }),
      (supabase as any).from("venue_calendar_settings").select("*").eq("venue_id", venueId).maybeSingle(),
      (supabase as any).from("venue_blackout_dates").select("*").eq("venue_id", venueId).order("start_date", { ascending: true }),
      (supabase as any).from("venue_ai_settings").select("*").eq("venue_id", venueId).maybeSingle(),
    ])

    return NextResponse.json({
      venue,
      spaces: spacesRes.data ?? [],
      amenities: amenitiesRes.data ?? [],
      eventTypes: eventTypesRes.data ?? [],
      packages: packagesRes.data ?? [],
      packageAddons: addonsRes.data ?? [],
      photos: photosRes.data ?? [],
      testimonials: testimonialsRes.data ?? [],
      calendarSettings: calendarSettingsRes.data ?? null,
      blackoutDates: blackoutDatesRes.data ?? [],
      aiSettings: aiSettingsRes.data ?? null,
    })
  } catch (error: any) {
    console.error("Error fetching editor public page data:", error)
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { supabase } = auth
    const body = await request.json()

    const venueUpdate = body.venue || {}
    const spaceUpdates = Array.isArray(body.spaces) ? body.spaces : []

    if (Object.keys(venueUpdate).length > 0) {
      const safeVenue = { ...venueUpdate }
      delete safeVenue.id
      delete safeVenue.owner_id
      delete safeVenue.created_at
      const { error } = await (supabase as any)
        .from("venues")
        .update({ ...safeVenue, updated_at: new Date().toISOString() })
        .eq("id", venueId)
      if (error) throw error
    }

    const persistedSpaceIds = spaceUpdates
      .map((s: { id?: string }) => s.id)
      .filter((id: string | undefined) => Boolean(id && !String(id).startsWith("temp-")))

    if (spaceUpdates.length === 0) {
      const { error: deleteAllError } = await (supabase as any)
        .from("spaces")
        .delete()
        .eq("venue_id", venueId)
      if (deleteAllError) throw deleteAllError
    } else if (persistedSpaceIds.length > 0) {
      const idList = persistedSpaceIds.map((id: string) => `"${id}"`).join(",")
      const { error: deleteError } = await (supabase as any)
        .from("spaces")
        .delete()
        .eq("venue_id", venueId)
        .not("id", "in", `(${idList})`)
      if (deleteError) throw deleteError
    }

    for (const space of spaceUpdates) {
      const id = space.id
      const updateFields = { ...space }
      delete updateFields.id
      delete updateFields.created_at
      delete updateFields.updated_at
      if (!id || String(id).startsWith("temp-")) {
        const { error } = await (supabase as any)
          .from("spaces")
          .insert({ venue_id: venueId, ...updateFields })
        if (error) throw error
        continue
      }

      const { error } = await (supabase as any)
        .from("spaces")
        .update({ ...updateFields, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("venue_id", venueId)
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error batch-saving editor public page:", error)
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}
