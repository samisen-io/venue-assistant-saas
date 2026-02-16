/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { venueId } = await params

    // Verify ownership
    const { data: venue } = await (supabase as any)
      .from("venues")
      .select("id, owner_id")
      .eq("id", venueId)
      .eq("owner_id", user.id)
      .single()

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    // Fetch public settings
    const { data: settings } = await (supabase as any)
      .from("venue_public_settings")
      .select("*")
      .eq("venue_id", venueId)
      .single()

    return NextResponse.json(settings || {
      venue_id: venueId,
      is_visible_on_marketplace: false,
      featured: false,
      search_keywords: [],
      auto_respond_enabled: false,
      auto_respond_message: null,
      response_time_goal: "24h",
    })
  } catch (error) {
    console.error("Marketplace settings GET error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { venueId } = await params
    const body = await request.json()

    // Verify ownership
    const { data: venue } = await (supabase as any)
      .from("venues")
      .select("id, owner_id")
      .eq("id", venueId)
      .eq("owner_id", user.id)
      .single()

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    const updateData = {
      venue_id: venueId,
      is_visible_on_marketplace: body.is_visible_on_marketplace ?? false,
      search_keywords: body.search_keywords ?? [],
      auto_respond_enabled: body.auto_respond_enabled ?? false,
      auto_respond_message: body.auto_respond_message ?? null,
      response_time_goal: body.response_time_goal ?? "24h",
      updated_at: new Date().toISOString(),
    }

    // Upsert - create if not exists, update if exists
    const { data: settings, error } = await (supabase as any)
      .from("venue_public_settings")
      .upsert(updateData, { onConflict: "venue_id" })
      .select()
      .single()

    if (error) {
      console.error("Marketplace settings update error:", error)
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Marketplace settings PUT error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
