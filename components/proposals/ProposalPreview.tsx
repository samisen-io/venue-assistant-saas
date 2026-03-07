"use client"

import { useState } from "react"
import type { Database } from "@/lib/types/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProposalStatusBadge } from "./ProposalStatusBadge"
import type { ProposalStatus } from "@/lib/types/proposal.types"
import { Trash2, Plus } from "lucide-react"

type Proposal = Database["public"]["Tables"]["proposals"]["Row"]

type LineItem = {
  label: string
  quantity: number
  unitPrice: number
}

type ProposalPreviewProps = {
  proposal: Proposal
  onSave?: (updates: Partial<Proposal>) => Promise<void> | void
  onSend?: () => Promise<void> | void
  saving?: boolean
  sending?: boolean
}

function inclusionsToText(inclusions: unknown): string {
  if (Array.isArray(inclusions)) return inclusions.join("\n")
  if (typeof inclusions === "string") return inclusions
  return ""
}

function textToInclusions(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean)
}

function initLineItems(pricing: Record<string, unknown>): LineItem[] {
  const raw = Array.isArray(pricing.lineItems)
    ? (pricing.lineItems as Array<Record<string, unknown>>)
    : []
  if (raw.length === 0) return [{ label: "", quantity: 1, unitPrice: 0 }]
  return raw.map((item) => ({
    label: String(item.label ?? ""),
    quantity: Number(item.quantity ?? 1),
    unitPrice: item.unitPrice != null
      ? Number(item.unitPrice)
      : Number(item.amount ?? 0),
  }))
}

export function ProposalPreview({
  proposal,
  onSave,
  onSend,
  saving = false,
  sending = false,
}: ProposalPreviewProps) {
  const rawPricing = ((proposal.pricing_breakdown as Record<string, unknown>) ?? {}) as Record<string, unknown>

  const [validUntil, setValidUntil] = useState(proposal.valid_until || "")
  const [depositAmount, setDepositAmount] = useState(String(proposal.deposit_amount ?? ""))
  const [inclusions, setInclusions] = useState(() => inclusionsToText(proposal.inclusions))
  const [terms, setTerms] = useState(proposal.terms_and_policies || "")
  const [lineItems, setLineItems] = useState<LineItem[]>(() => initLineItems(rawPricing))
  const [tax, setTax] = useState(String(rawPricing.taxes ?? "0"))

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxNum = Number(tax) || 0
  const total = subtotal + taxNum

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setLineItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: field === "label" ? value : Number(value) || 0 }
          : item
      )
    )
  }

  function addItem() {
    setLineItems((prev) => [...prev, { label: "", quantity: 1, unitPrice: 0 }])
  }

  function removeItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    const builtLineItems = lineItems
      .filter((item) => item.label.trim())
      .map((item) => ({
        label: item.label,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice,
      }))

    const updatedPricing = {
      ...rawPricing,
      lineItems: builtLineItems,
      subtotal,
      taxes: taxNum,
      total,
    }

    await onSave?.({
      valid_until: validUntil || null,
      total_estimated: total,
      deposit_amount: depositAmount ? Number(depositAmount) : null,
      pricing_breakdown: updatedPricing as Proposal["pricing_breakdown"],
      inclusions: textToInclusions(inclusions) as Proposal["inclusions"],
      terms_and_policies: terms,
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Proposal Editor</CardTitle>
        <ProposalStatusBadge status={(proposal.status as ProposalStatus) || "draft"} />
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Reference + Valid Until */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Reference</Label>
            <Input value={proposal.reference_number} readOnly className="bg-muted" />
          </div>
          <div>
            <Label htmlFor="proposal-valid-until">Valid Until</Label>
            <Input
              id="proposal-valid-until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
        </div>

        {/* Line items */}
        <div className="space-y-2">
          <Label>Line Items</Label>
          <div className="rounded-md border overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_80px_100px_90px_36px] gap-2 bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Amount</span>
              <span />
            </div>

            {/* Item rows */}
            <div className="divide-y">
              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_80px_100px_90px_36px] gap-2 items-center px-3 py-2">
                  <Input
                    value={item.label}
                    onChange={(e) => updateItem(idx, "label", e.target.value)}
                    placeholder="Item description"
                    className="h-8 text-sm border-0 shadow-none px-1 focus-visible:ring-1"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    className="h-8 text-sm text-right border-0 shadow-none px-1 focus-visible:ring-1"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                    className="h-8 text-sm text-right border-0 shadow-none px-1 focus-visible:ring-1"
                  />
                  <span className="text-sm text-right pr-1 tabular-nums">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(idx)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add row */}
            <div className="px-3 py-2 border-t bg-muted/20">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addItem}>
                <Plus className="h-3.5 w-3.5" />
                Add line item
              </Button>
            </div>

            {/* Totals */}
            <div className="border-t px-3 py-3 space-y-1 text-sm bg-muted/10">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Tax ($)</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className="h-7 w-28 text-right text-sm"
                />
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t">
                <span>Total</span>
                <span className="tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deposit */}
        <div>
          <Label htmlFor="proposal-deposit">Deposit Required ($)</Label>
          <Input
            id="proposal-deposit"
            type="number"
            min="0"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Inclusions */}
        <div className="space-y-2">
          <Label htmlFor="proposal-inclusions">
            What&apos;s Included
            <span className="ml-1 text-xs font-normal text-muted-foreground">(one item per line)</span>
          </Label>
          <Textarea
            id="proposal-inclusions"
            value={inclusions}
            onChange={(e) => setInclusions(e.target.value)}
            placeholder={"Full-day rental\nAV equipment\nOn-site coordinator"}
            className="min-h-[100px]"
          />
        </div>

        {/* Terms */}
        <div className="space-y-2">
          <Label htmlFor="proposal-terms">Terms and Policies</Label>
          <Textarea
            id="proposal-terms"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Actions */}
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
