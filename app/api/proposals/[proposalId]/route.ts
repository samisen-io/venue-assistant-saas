/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateProposalPDF, uploadProposalPdf } from "@/lib/proposals/pdfGenerator"

// Get the venue_id via the proposal — the RLS on proposals enforces ownership.
async function getAuthedVenueIdForProposal(supabase: any, proposalId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: proposal } = await supabase
    .from("proposals")
    .select("venue_id")
    .eq("id", proposalId)
    .maybeSingle()
  return proposal?.venue_id ?? null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const supabase = await createClient()
    const { proposalId } = await params
    const venueId = await getAuthedVenueIdForProposal(supabase, proposalId)
    if (!venueId) return new NextResponse("Unauthorized", { status: 401 })

    const { data: proposal, error } = await (supabase as any)
      .from("proposals")
      .select("*, lead:leads(*)")
      .eq("id", proposalId)
      .eq("venue_id", venueId)
      .single()

    if (error || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }
    return NextResponse.json(proposal)
  } catch (error: any) {
    console.error("Error fetching proposal:", error)
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const supabase = await createClient()
    const { proposalId } = await params
    const venueId = await getAuthedVenueIdForProposal(supabase, proposalId)
    if (!venueId) return new NextResponse("Unauthorized", { status: 401 })
    const body = await request.json()

    const { data: existing, error: existingError } = await (supabase as any)
      .from("proposals")
      .select("*")
      .eq("id", proposalId)
      .eq("venue_id", venueId)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    const allowedFields = [
      "event_summary",
      "pricing_breakdown",
      "inclusions",
      "terms_and_policies",
      "total_estimated",
      "deposit_amount",
      "valid_until",
      "status",
    ]
    const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowedFields) {
      if (body[key] !== undefined) updateFields[key] = body[key]
    }

    const { data: updated, error: updateError } = await (supabase as any)
      .from("proposals")
      .update(updateFields)
      .eq("id", proposalId)
      .eq("venue_id", venueId)
      .select("*")
      .single()

    if (updateError) throw updateError

    const { data: venue } = await (supabase as any)
      .from("venues")
      .select("*")
      .eq("id", venueId)
      .single()
    const { data: spaces } = await (supabase as any)
      .from("spaces")
      .select("*")
      .eq("venue_id", venueId)
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (venue) {
      const pdfBuffer = await generateProposalPDF(updated, venue, spaces ?? [])
      const pdfUrl = await uploadProposalPdf(updated.id, venueId, pdfBuffer)
      const { data: finalProposal } = await (supabase as any)
        .from("proposals")
        .update({ pdf_url: pdfUrl, updated_at: new Date().toISOString() })
        .eq("id", proposalId)
        .select("*")
        .single()
      return NextResponse.json(finalProposal ?? updated)
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Error updating proposal:", error)
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

