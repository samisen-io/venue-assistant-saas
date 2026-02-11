/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export interface Notification {
  id: string
  type: "new_lead" | "lead_status" | "new_conversation" | "proposal_viewed"
  title: string
  description: string
  read: boolean
  created_at: string
  link?: string
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's venue
    const { data: venues } = await (supabase as any)
      .from("venues")
      .select("id, name")
      .eq("owner_id", user.id)
    const venue = venues?.[0]
    if (!venue) {
      return NextResponse.json([])
    }

    // Get recent leads as notifications
    const { data: leads } = await (supabase as any)
      .from("leads")
      .select("id, contact_name, event_type, status, priority_score, source, created_at")
      .eq("venue_id", venue.id)
      .order("created_at", { ascending: false })
      .limit(15)

    // Get recent conversations
    const { data: conversations } = await (supabase as any)
      .from("conversations")
      .select("id, prospect_name, prospect_email, status, message_count, created_at")
      .eq("venue_id", venue.id)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get recent proposals that were viewed
    const { data: proposals } = await (supabase as any)
      .from("proposals")
      .select("id, lead_id, reference_number, status, viewed_at, created_at")
      .eq("venue_id", venue.id)
      .eq("status", "viewed")
      .order("viewed_at", { ascending: false })
      .limit(5)

    const notifications: Notification[] = []

    // Convert leads to notifications
    if (leads) {
      for (const lead of leads) {
        const priorityLabel =
          lead.priority_score >= 80
            ? "High priority"
            : lead.priority_score >= 60
              ? "Medium priority"
              : "New"

        notifications.push({
          id: `lead-${lead.id}`,
          type: lead.status === "new" ? "new_lead" : "lead_status",
          title:
            lead.status === "new"
              ? `New Lead: ${lead.contact_name || "Unknown"}`
              : `Lead Update: ${lead.contact_name || "Unknown"}`,
          description: `${lead.event_type || "Event"} inquiry - ${priorityLabel} (${lead.priority_score}/100)`,
          read: lead.status !== "new",
          created_at: lead.created_at,
          link: `/leads/${lead.id}`,
        })
      }
    }

    // Convert conversations to notifications
    if (conversations) {
      for (const convo of conversations) {
        if (convo.message_count >= 3) {
          notifications.push({
            id: `convo-${convo.id}`,
            type: "new_conversation",
            title: `Chat: ${convo.prospect_name || convo.prospect_email || "Visitor"}`,
            description: `${convo.message_count} messages - ${convo.status}`,
            read: convo.status !== "active",
            created_at: convo.created_at,
            link: "/leads",
          })
        }
      }
    }

    // Convert proposals to notifications
    if (proposals) {
      for (const proposal of proposals) {
        notifications.push({
          id: `proposal-${proposal.id}`,
          type: "proposal_viewed",
          title: `Proposal Viewed: ${proposal.reference_number}`,
          description: "A prospect has viewed your proposal",
          read: false,
          created_at: proposal.viewed_at || proposal.created_at,
          link: `/leads/${proposal.lead_id}`,
        })
      }
    }

    // Sort by date, newest first
    notifications.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json(notifications.slice(0, 20))
  } catch (error) {
    console.error("Notifications error:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Accept notification IDs to mark as read
    // Since notifications are derived from leads/conversations, we don't have a
    // dedicated notifications table. For lead-based notifications, we can update
    // their status if they're "new".
    const body = await request.json()
    const { ids } = body as { ids: string[] }

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: "ids array required" },
        { status: 400 }
      )
    }

    // Extract lead IDs from notification IDs and update their status from "new" to "contacted"
    const leadIds = ids
      .filter((id) => id.startsWith("lead-"))
      .map((id) => id.replace("lead-", ""))

    if (leadIds.length > 0) {
      await (supabase as any)
        .from("leads")
        .update({ status: "contacted" })
        .in("id", leadIds)
        .eq("status", "new")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update notifications error:", error)
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}
