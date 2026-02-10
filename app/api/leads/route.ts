/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return new NextResponse("Unauthorized", { status: 401 })

    // Get user's venue
    const { data: venue } = await (supabase as any)
      .from("venues")
      .select("id")
      .eq("owner_id", user.id)
      .single()
    if (!venue) return NextResponse.json([])

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const source = searchParams.get("source")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    let query = (supabase as any)
      .from("leads")
      .select("*")
      .eq("venue_id", venue.id)

    if (status && status !== "all") query = query.eq("status", status)
    if (source && source !== "all") query = query.eq("source", source)
    if (search) {
      query = query.or(
        `contact_name.ilike.%${search}%,contact_email.ilike.%${search}%,company.ilike.%${search}%`
      )
    }

    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    const { data: leads, error } = await query
    if (error) throw error

    return NextResponse.json(leads ?? [])
  } catch (error: any) {
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return new NextResponse("Unauthorized", { status: 401 })

    const { data: venue } = await (supabase as any)
      .from("venues")
      .select("id")
      .eq("owner_id", user.id)
      .single()
    if (!venue)
      return NextResponse.json({ error: "No venue found" }, { status: 400 })

    const body = await request.json()

    const { data: lead, error } = await (supabase as any)
      .from("leads")
      .insert({
        venue_id: venue.id,
        source: body.source || "manual",
        contact_name: body.contact_name,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone || null,
        company: body.company || null,
        event_type: body.event_type || null,
        event_date: body.event_date || null,
        guest_count: body.guest_count || null,
        estimated_budget: body.estimated_budget || null,
        notes: body.notes || null,
        status: "new",
        priority_score: body.priority_score || 50,
      })
      .select()
      .single()

    if (error) throw error

    // Log creation activity
    await (supabase as any).from("lead_activities").insert({
      lead_id: lead.id,
      activity_type: "created",
      description: "Lead created manually.",
    })

    return NextResponse.json(lead)
  } catch (error: any) {
    console.error("Error creating lead:", error)
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}
