/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateProposal } from "@/lib/proposals/proposalGenerator"
import { generateProposalPDF, uploadProposalPdf } from "@/lib/proposals/pdfGenerator"
import { sendEmail } from "@/lib/email/resend"
import {
  generateProposalEmailHTML,
  generateProposalEmailSubject,
} from "@/lib/email/templates/proposal"

// Get the venue_id via the lead itself — the RLS on leads already enforces ownership,
// so if the user can see the lead they own the venue. This handles multi-venue accounts.
async function getAuthedVenueIdForLead(supabase: any, leadId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: lead } = await supabase
    .from("leads")
    .select("venue_id")
    .eq("id", leadId)
    .maybeSingle()
  return lead?.venue_id ?? null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const supabase = await createClient()
    const { leadId } = await params
    const venueId = await getAuthedVenueIdForLead(supabase, leadId)
    if (!venueId) return new NextResponse("Unauthorized", { status: 401 })
    const { data: proposal, error } = await (supabase as any)
      .from("proposals")
      .select("*")
      .eq("lead_id", leadId)
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return NextResponse.json(proposal ?? null)
  } catch (error: any) {
    console.error("Error fetching lead proposal:", error)
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const supabase = await createClient()
    const { leadId } = await params
    const venueId = await getAuthedVenueIdForLead(supabase, leadId)
    if (!venueId) return new NextResponse("Unauthorized", { status: 401 })
    const body = await request.json()

    const { data: lead, error: leadError } = await (supabase as any)
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .eq("venue_id", venueId)
      .single()
    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const { data: venue, error: venueError } = await (supabase as any)
      .from("venues")
      .select("*")
      .eq("id", venueId)
      .single()
    if (venueError || !venue) throw venueError || new Error("Venue not found")

    const { data: packages, error: packagesError } = await (supabase as any)
      .from("venue_packages")
      .select("*")
      .eq("venue_id", venueId)
      .order("display_order", { ascending: true })
    if (packagesError) throw packagesError

    const { data: addons, error: addonsError } = await (supabase as any)
      .from("venue_package_addons")
      .select("*")
      .eq("venue_id", venueId)
    if (addonsError) throw addonsError

    const draft = generateProposal({
      lead,
      venue,
      packages: packages ?? [],
      addons: addons ?? [],
      selectedPackageId: body.packageId,
      selectedAddonIds: body.addonIds,
      eventDetails: body.eventDetails,
      validDays: body.validDays,
      termsAndPolicies: body.termsAndPolicies,
    })

    const { data: proposal, error: insertError } = await (supabase as any)
      .from("proposals")
      .insert({
        lead_id: leadId,
        venue_id: venueId,
        reference_number: draft.referenceNumber,
        event_summary: draft.eventSummary,
        pricing_breakdown: draft.pricingBreakdown,
        inclusions: draft.inclusions,
        terms_and_policies: draft.termsAndPolicies,
        total_estimated: draft.totalEstimated,
        deposit_amount: draft.depositAmount,
        valid_until: draft.validUntil,
        status: "draft",
      })
      .select("*")
      .single()
    if (insertError) throw insertError

    const { data: spaces } = await (supabase as any)
      .from("spaces")
      .select("*")
      .eq("venue_id", venueId)
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    const pdfBuffer = await generateProposalPDF(proposal, venue, spaces ?? [])
    const pdfUrl = await uploadProposalPdf(proposal.id, venueId, pdfBuffer)

    const { data: updatedProposal, error: pdfUpdateError } = await (supabase as any)
      .from("proposals")
      .update({ pdf_url: pdfUrl, updated_at: new Date().toISOString() })
      .eq("id", proposal.id)
      .select("*")
      .single()
    if (pdfUpdateError) throw pdfUpdateError

    await (supabase as any).from("lead_activities").insert({
      lead_id: leadId,
      activity_type: "proposal_sent",
      description: `Proposal draft ${proposal.reference_number} generated.`,
      metadata: { proposal_id: proposal.id, status: "draft" },
    })

    if (body.send === true && lead.contact_email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.venuemanager.com"
      const acceptUrl = (updatedProposal as any).public_token
        ? `${appUrl}/proposals/${(updatedProposal as any).public_token}`
        : undefined

      await sendEmail({
        to: lead.contact_email,
        from: venue.email || "noreply@venuemanager.com",
        subject: generateProposalEmailSubject({
          prospectName: lead.contact_name,
          venueName: venue.name,
          referenceNumber: updatedProposal.reference_number,
          totalEstimated: updatedProposal.total_estimated,
          validUntil: updatedProposal.valid_until,
          pdfUrl: updatedProposal.pdf_url || "",
        }),
        body: generateProposalEmailHTML({
          prospectName: lead.contact_name,
          venueName: venue.name,
          referenceNumber: updatedProposal.reference_number,
          totalEstimated: updatedProposal.total_estimated,
          validUntil: updatedProposal.valid_until,
          pdfUrl: updatedProposal.pdf_url || "",
          acceptUrl,
        }),
      })

      await (supabase as any)
        .from("proposals")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", proposal.id)

      await (supabase as any)
        .from("leads")
        .update({ status: "proposal_sent", updated_at: new Date().toISOString() })
        .eq("id", leadId)
        .eq("venue_id", venueId)
    }

    return NextResponse.json(updatedProposal, { status: 201 })
  } catch (error: any) {
    console.error("Error generating proposal:", error)
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

