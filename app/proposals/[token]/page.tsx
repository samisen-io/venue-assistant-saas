import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import { ProposalAcceptanceView } from "./ProposalAcceptanceView"

/* eslint-disable @typescript-eslint/no-explicit-any */

type Props = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const admin = createAdminClient()
  const { data } = await (admin as any)
    .from("proposals")
    .select("reference_number, venue:venues(name)")
    .eq("public_token", token)
    .maybeSingle()

  if (!data) return { title: "Proposal Not Found" }
  return {
    title: `Proposal ${data.reference_number} — ${data.venue?.name ?? "Event Venue"}`,
  }
}

export default async function ProposalAcceptancePage({ params }: Props) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: proposal, error } = await (admin as any)
    .from("proposals")
    .select("*, venue:venues(id, name, email)")
    .eq("public_token", token)
    .maybeSingle()

  if (error || !proposal) {
    notFound()
  }

  // Mark as viewed on first server-side open when status is "sent"
  if (!proposal.viewed_at && proposal.status === "sent") {
    await (admin as any)
      .from("proposals")
      .update({
        viewed_at: new Date().toISOString(),
        status: "viewed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposal.id)

    await (admin as any).from("lead_activities").insert({
      lead_id: proposal.lead_id,
      activity_type: "proposal_viewed",
      description: `Proposal ${proposal.reference_number} was opened by the client.`,
      metadata: { proposal_id: proposal.id },
    })

    proposal.viewed_at = new Date().toISOString()
    proposal.status = "viewed"
  }

  return <ProposalAcceptanceView proposal={proposal} token={token} />
}
