/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email/resend"
import { generateProposalAcceptedEmailHTML } from "@/lib/email/templates/proposalAccepted"

// GET /api/proposals/public/[token]
// Returns proposal data for the client-facing acceptance page.
// Marks the proposal as "viewed" on first open.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: proposal, error } = await (admin as any)
    .from("proposals")
    .select("*, venue:venues(id, name, email)")
    .eq("public_token", token)
    .maybeSingle()

  if (error || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
  }

  // Mark as viewed on first open when status is "sent"
  if (!proposal.viewed_at && proposal.status === "sent") {
    await (admin as any)
      .from("proposals")
      .update({
        viewed_at: new Date().toISOString(),
        status: "viewed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposal.id)
    proposal.viewed_at = new Date().toISOString()
    proposal.status = "viewed"

    // Log proposal_viewed activity
    await (admin as any).from("lead_activities").insert({
      lead_id: proposal.lead_id,
      activity_type: "proposal_viewed",
      description: `Proposal ${proposal.reference_number} was opened by the client.`,
      metadata: { proposal_id: proposal.id },
    })
  }

  return NextResponse.json(proposal)
}

// POST /api/proposals/public/[token]
// Body: { action: "accept" | "decline", name?: string }
// Handles client acceptance (with typed name as e-signature) or decline.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const admin = createAdminClient()

  let body: { action?: string; name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { action, name } = body

  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  if (action === "accept" && (!name || typeof name !== "string" || !name.trim())) {
    return NextResponse.json(
      { error: "Your full name is required to accept the proposal" },
      { status: 400 }
    )
  }

  const { data: proposal, error } = await (admin as any)
    .from("proposals")
    .select("*, venue:venues(id, name, email), lead:leads(id, contact_name, contact_email, event_date)")
    .eq("public_token", token)
    .maybeSingle()

  if (error || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
  }

  if (proposal.status === "accepted" || proposal.status === "declined") {
    return NextResponse.json(
      { error: "This proposal has already been responded to", status: proposal.status },
      { status: 409 }
    )
  }

  // Get client IP for the audit trail
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"

  if (action === "accept") {
    const signedName = (name as string).trim()

    await (admin as any)
      .from("proposals")
      .update({
        status: "accepted",
        accepted_by_name: signedName,
        accepted_at: new Date().toISOString(),
        accepted_ip: ip,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposal.id)

    // Auto-update lead status to "won"
    await (admin as any)
      .from("leads")
      .update({ status: "won", updated_at: new Date().toISOString() })
      .eq("id", proposal.lead_id)

    // Record activity
    await (admin as any).from("lead_activities").insert({
      lead_id: proposal.lead_id,
      activity_type: "proposal_accepted",
      description: `Proposal ${proposal.reference_number} accepted by ${signedName}.`,
      metadata: { proposal_id: proposal.id, signed_by: signedName, ip },
    })

    // Notify venue manager
    const eventSummary = (proposal.event_summary as Record<string, unknown>) ?? {}
    const eventDate = String(eventSummary.event_date ?? proposal.lead?.event_date ?? "TBD")
    if (proposal.venue?.email) {
      await sendEmail({
        to: proposal.venue.email,
        from: proposal.venue.email,
        subject: `🎉 ${signedName} accepted your proposal for ${eventDate}`,
        body: generateProposalAcceptedEmailHTML({
          clientName: signedName,
          venueName: proposal.venue.name,
          eventDate,
          proposalReference: proposal.reference_number,
          leadId: proposal.lead_id,
        }),
      }).catch((err: unknown) =>
        console.error("Failed to send acceptance notification:", err)
      )
    }

    return NextResponse.json({ success: true, status: "accepted" })
  } else {
    // Decline
    await (admin as any)
      .from("proposals")
      .update({
        status: "declined",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposal.id)

    await (admin as any).from("lead_activities").insert({
      lead_id: proposal.lead_id,
      activity_type: "proposal_declined",
      description: `Proposal ${proposal.reference_number} was declined by the client.`,
      metadata: { proposal_id: proposal.id },
    })

    return NextResponse.json({ success: true, status: "declined" })
  }
}
