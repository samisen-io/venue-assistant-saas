/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/resend"
import {
  generateProposalEmailHTML,
  generateProposalEmailSubject,
} from "@/lib/email/templates/proposal"

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

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const supabase = await createClient()
    const venueId = await getAuthedVenueId(supabase)
    if (!venueId) return new NextResponse("Unauthorized", { status: 401 })
    const { proposalId } = await params

    const { data: proposal, error } = await (supabase as any)
      .from("proposals")
      .select("*, lead:leads(*), venue:venues(*)")
      .eq("id", proposalId)
      .eq("venue_id", venueId)
      .single()

    if (error || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    if (!proposal.lead?.contact_email) {
      return NextResponse.json(
        { error: "Lead contact email is required before sending a proposal" },
        { status: 400 }
      )
    }

    if (!proposal.pdf_url) {
      return NextResponse.json(
        { error: "Proposal PDF is missing. Regenerate proposal before sending." },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.venuemanager.com"
    const acceptUrl = proposal.public_token
      ? `${appUrl}/proposals/${proposal.public_token}`
      : undefined

    const subject = generateProposalEmailSubject({
      prospectName: proposal.lead.contact_name,
      venueName: proposal.venue?.name || "Venue",
      referenceNumber: proposal.reference_number,
      totalEstimated: proposal.total_estimated,
      validUntil: proposal.valid_until,
      pdfUrl: proposal.pdf_url,
    })
    const html = generateProposalEmailHTML({
      prospectName: proposal.lead.contact_name,
      venueName: proposal.venue?.name || "Venue",
      referenceNumber: proposal.reference_number,
      totalEstimated: proposal.total_estimated,
      validUntil: proposal.valid_until,
      pdfUrl: proposal.pdf_url,
      acceptUrl,
    })

    const result = await sendEmail({
      to: proposal.lead.contact_email,
      from: proposal.venue?.email || "noreply@venuemanager.com",
      subject,
      body: html,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 })
    }

    await (supabase as any)
      .from("proposals")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposalId)
      .eq("venue_id", venueId)

    await (supabase as any)
      .from("leads")
      .update({
        status: "proposal_sent",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposal.lead_id)
      .eq("venue_id", venueId)

    await (supabase as any).from("lead_activities").insert({
      lead_id: proposal.lead_id,
      activity_type: "proposal_sent",
      description: `Proposal ${proposal.reference_number} sent to ${proposal.lead.contact_email}.`,
      metadata: { proposal_id: proposal.id, message_id: result.messageId },
    })

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (error: any) {
    console.error("Error sending proposal:", error)
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

