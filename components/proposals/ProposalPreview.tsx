"use client"

import { useMemo, useState } from "react"
import type { Database, Json } from "@/lib/types/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProposalStatusBadge } from "./ProposalStatusBadge"
import type { ProposalStatus } from "@/lib/types/proposal.types"

type Proposal = Database["public"]["Tables"]["proposals"]["Row"]

type ProposalPreviewProps = {
  proposal: Proposal
  onSave?: (updates: Partial<Proposal>) => Promise<void> | void
  onSend?: () => Promise<void> | void
  saving?: boolean
  sending?: boolean
}

export function ProposalPreview({
  proposal,
  onSave,
  onSend,
  saving = false,
  sending = false,
}: ProposalPreviewProps) {
  const [terms, setTerms] = useState(proposal.terms_and_policies || "")
  const [inclusionsText, setInclusionsText] = useState(
    JSON.stringify(proposal.inclusions ?? [], null, 2)
  )
  const [totalEstimated, setTotalEstimated] = useState(
    String(proposal.total_estimated ?? "")
  )

  const pricing = useMemo(
    () =>
      ((proposal.pricing_breakdown as Record<string, unknown>) ?? {
        lineItems: [],
      }) as Record<string, unknown>,
    [proposal.pricing_breakdown]
  )

  const lineItems = Array.isArray(pricing.lineItems)
    ? (pricing.lineItems as Array<Record<string, unknown>>)
    : []

  const handleSave = async () => {
    let parsedInclusions: Json | null = null
    try {
      parsedInclusions = inclusionsText.trim() ? JSON.parse(inclusionsText) : null
    } catch {
      parsedInclusions = proposal.inclusions
    }

    await onSave?.({
      terms_and_policies: terms,
      inclusions: parsedInclusions as Proposal["inclusions"],
      total_estimated: totalEstimated ? Number(totalEstimated) : null,
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Proposal Preview</CardTitle>
        <ProposalStatusBadge status={(proposal.status as ProposalStatus) || "draft"} />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Reference</Label>
            <Input value={proposal.reference_number} readOnly />
          </div>
          <div>
            <Label>Valid Until</Label>
            <Input value={proposal.valid_until || ""} readOnly />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pricing</Label>
          <div className="rounded-md border p-3 text-sm">
            {lineItems.length === 0 ? (
              <p className="text-muted-foreground">No line items</p>
            ) : (
              <div className="space-y-1">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span>{String(item.label ?? "Item")}</span>
                    <span>${Number(item.amount ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 border-t pt-2">
              <p>Subtotal: ${Number(pricing.subtotal ?? 0).toFixed(2)}</p>
              <p>Tax: ${Number(pricing.taxes ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposal-total-estimated">Total Estimated</Label>
          <Input
            id="proposal-total-estimated"
            type="number"
            value={totalEstimated}
            onChange={(e) => setTotalEstimated(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposal-inclusions">Inclusions (JSON)</Label>
          <Textarea
            id="proposal-inclusions"
            value={inclusionsText}
            onChange={(e) => setInclusionsText(e.target.value)}
            className="min-h-[120px] font-mono text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposal-terms">Terms and Policies</Label>
          <Textarea
            id="proposal-terms"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button data-testid="save-proposal-draft-btn" variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button data-testid="send-proposal-btn" onClick={() => onSend?.()} disabled={sending}>
            {sending ? "Sending..." : "Send Proposal"}
          </Button>
          {proposal.pdf_url && (
            <Button variant="secondary" asChild>
              <a href={proposal.pdf_url} target="_blank" rel="noreferrer">
                Open PDF
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
