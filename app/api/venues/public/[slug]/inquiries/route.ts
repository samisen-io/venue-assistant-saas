/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/utils/rateLimit"

const INQUIRY_RATE_LIMIT = {
  limit: 10,
  windowSeconds: 3600,
  identifier: "venue-inquiry",
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(ip, INQUIRY_RATE_LIMIT)
    if (!rl.success) return rateLimitResponse(rl)

    const { slug } = await params
    const body = await request.json()
    const { name, email, phone, event_type, event_date, guest_count, message } =
      body as {
        name?: string
        email?: string
        phone?: string
        event_type?: string
        event_date?: string
        guest_count?: number
        message?: string
      }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Look up venue by slug
    const { data: venue } = await (supabase as any)
      .from("venues")
      .select("id")
      .eq("slug", slug)
      .eq("page_status", "published")
      .limit(1)
      .single()

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    // Create lead directly (skips conversation)
    const { data: lead, error: leadError } = await (supabase as any)
      .from("leads")
      .insert({
        venue_id: venue.id,
        source: "manual",
        contact_name: name,
        contact_email: email,
        contact_phone: phone || null,
        event_type: event_type || null,
        event_date: event_date || null,
        guest_count: guest_count || null,
        notes: message || null,
        status: "new",
        priority_score: 50,
      })
      .select("id")
      .single()

    if (leadError) {
      console.error("Failed to create lead:", leadError)
      return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 })
    }

    // Log activity
    await (supabase as any).from("lead_activities").insert({
      lead_id: lead.id,
      activity_type: "created",
      description: "Inquiry submitted via contact form on public page.",
    })

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been submitted. We'll be in touch soon!",
    })
  } catch (error) {
    console.error("Inquiry API error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
