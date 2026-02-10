/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

async function getAuthedVenueId(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: venue } = await supabase
    .from("venues")
    .select("id")
    .eq("owner_id", user.id)
    .single()
  return venue?.id ?? null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const supabase = await createClient()
    const venueId = await getAuthedVenueId(supabase)
    if (!venueId) return new NextResponse("Unauthorized", { status: 401 })

    const { leadId } = await params

    const { data: lead, error } = await (supabase as any)
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .eq("venue_id", venueId)
      .single()

    if (error || !lead)
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })

    // Load conversation transcript if linked
    let conversation = null
    let messages: any[] = []
    if (lead.conversation_id) {
      const { data: conv } = await (supabase as any)
        .from("conversations")
        .select("*")
        .eq("id", lead.conversation_id)
        .single()
      conversation = conv

      if (conv) {
        const { data: msgs } = await (supabase as any)
          .from("conversation_messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true })
        messages = msgs ?? []
      }
    }

    // Load activities
    const { data: activities } = await (supabase as any)
      .from("lead_activities")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })

    return NextResponse.json({
      lead,
      conversation,
      messages,
      activities: activities ?? [],
    })
  } catch (error: any) {
    console.error("Error fetching lead:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const supabase = await createClient()
    const venueId = await getAuthedVenueId(supabase)
    if (!venueId) return new NextResponse("Unauthorized", { status: 401 })

    const { leadId } = await params
    const body = await request.json()

    const updateFields: Record<string, unknown> = {}
    const allowedFields = [
      "status",
      "notes",
      "assigned_to",
      "contact_name",
      "contact_email",
      "contact_phone",
      "company",
      "event_type",
      "event_date",
      "guest_count",
      "estimated_budget",
      "lost_reason",
      "priority_score",
    ]
    for (const key of allowedFields) {
      if (body[key] !== undefined) updateFields[key] = body[key]
    }
    updateFields.updated_at = new Date().toISOString()

    const { data: lead, error } = await (supabase as any)
      .from("leads")
      .update(updateFields)
      .eq("id", leadId)
      .eq("venue_id", venueId)
      .select()
      .single()

    if (error) throw error

    // Log status change
    if (body.status) {
      await (supabase as any).from("lead_activities").insert({
        lead_id: leadId,
        activity_type: "status_changed",
        description: `Status changed to "${body.status}"${body.lost_reason ? `: ${body.lost_reason}` : ""}.`,
      })
    }

    return NextResponse.json(lead)
  } catch (error: any) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const supabase = await createClient()
    const venueId = await getAuthedVenueId(supabase)
    if (!venueId) return new NextResponse("Unauthorized", { status: 401 })

    const { leadId } = await params

    const { error } = await (supabase as any)
      .from("leads")
      .delete()
      .eq("id", leadId)
      .eq("venue_id", venueId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting lead:", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
