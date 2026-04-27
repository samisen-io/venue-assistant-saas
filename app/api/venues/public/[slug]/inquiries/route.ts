/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/utils/rateLimit"
import { notifyVenueManager, sendProspectConfirmation } from "@/lib/leads/leadNotifier"

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
    const { name, email, phone, event_type, event_date, guest_count, message, _hp } =
      body as {
        name?: string
        email?: string
        phone?: string
        event_type?: string
        event_date?: string
        guest_count?: number
        message?: string
        _hp?: string
      }

    // Honeypot check — bots fill in hidden fields, humans don't
    if (_hp) {
      return NextResponse.json({ success: true, message: "Inquiry submitted." })
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Look up venue by slug — include name and owner_id for notifications
    const { data: venue } = await (supabase as any)
      .from("venues")
      .select("id, name, owner_id")
      .eq("slug", slug)
      .eq("page_status", "published")
      .limit(1)
      .single()

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    // Create lead directly (skips conversation)
    const referrer = request.headers.get("referer") || null
    const { data: lead, error: leadError } = await (supabase as any)
      .from("leads")
      .insert({
        venue_id: venue.id,
        source: "public_inquiry",
        contact_name: name,
        contact_email: email,
        contact_phone: phone || null,
        event_type: event_type || null,
        event_date: event_date || null,
        guest_count: guest_count || null,
        notes: message || null,
        status: "new",
        priority_score: 60,
        marketplace_inquiry_data: {
          event_description: message || null,
          referrer,
        },
      })
      .select("id")
      .single()

    if (leadError) {
      console.error("Failed to create lead:", leadError)
      return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 })
    }

    // Increment venue inquiry count (fire-and-forget)
    ;(supabase as any).rpc("increment_venue_inquiry_count", { venue_row_id: venue.id }).then(() => {})

    // Log activity
    await (supabase as any).from("lead_activities").insert({
      lead_id: lead.id,
      activity_type: "created",
      description: "Inquiry submitted via public venue page.",
    })

    // Fetch venue owner email for manager notification — fire-and-forget
    ;(async () => {
      try {
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("email")
          .eq("id", venue.owner_id)
          .single()

        if (profile?.email) {
          await notifyVenueManager({
            leadId: lead.id,
            contactName: name,
            contactEmail: email,
            eventType: event_type || null,
            eventDate: event_date || null,
            guestCount: guest_count || null,
            estimatedBudget: null,
            priorityScore: 50,
            source: "inquiry_form",
            venueName: venue.name,
            managerEmail: profile.email,
          })
        }

        await sendProspectConfirmation({
          prospectEmail: email,
          prospectName: name,
          venueName: venue.name,
          eventType: event_type || null,
          eventDate: event_date || null,
          referenceId: lead.id.slice(0, 8).toUpperCase(),
        })
      } catch (err) {
        console.error("Failed to send inquiry notification emails:", err)
      }
    })()

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
