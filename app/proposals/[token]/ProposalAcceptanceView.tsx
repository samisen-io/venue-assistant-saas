"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProposalAcceptanceViewProps = {
  proposal: {
    id: string
    reference_number: string
    total_estimated: number | null
    deposit_amount: number | null
    valid_until: string | null
    status: string
    event_summary: Record<string, unknown>
    pricing_breakdown: Record<string, unknown>
    accepted_by_name?: string | null
    accepted_at?: string | null
    pdf_url?: string | null
    venue: { name: string } | null
  }
  token: string
}

export function ProposalAcceptanceView({ proposal, token }: ProposalAcceptanceViewProps) {
  const [step, setStep] = useState<"view" | "sign" | "done" | "declined">(
    proposal.status === "accepted" ? "done" :
    proposal.status === "declined" ? "declined" :
    "view"
  )
  const [signatureName, setSignatureName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eventSummary = proposal.event_summary ?? {}
  const lineItems = Array.isArray((proposal.pricing_breakdown as Record<string, unknown>)?.lineItems)
    ? ((proposal.pricing_breakdown as Record<string, unknown>).lineItems as Array<Record<string, unknown>>)
    : []

  const isExpired =
    proposal.valid_until && new Date(proposal.valid_until) < new Date() && proposal.status !== "accepted"

  async function handleAccept() {
    if (!signatureName.trim()) {
      setError("Please enter your full name to confirm acceptance.")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/proposals/public/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", name: signatureName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.")
        return
      }
      setStep("done")
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDecline() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/proposals/public/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong.")
        return
      }
      setStep("declined")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-700 text-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">{proposal.venue?.name ?? "Event Venue"}</h1>
          <p className="mt-1 opacity-90">Event Proposal</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Status banner for already-responded proposals */}
        {step === "done" && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-green-800">Proposal Accepted!</h2>
            <p className="mt-2 text-green-700">
              {proposal.accepted_by_name
                ? `Signed by ${proposal.accepted_by_name}.`
                : "You have accepted this proposal."}{" "}
              {proposal.venue?.name} will be in touch shortly to confirm next steps.
            </p>
          </div>
        )}

        {step === "declined" && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
            <h2 className="text-xl font-bold text-gray-700">Proposal Declined</h2>
            <p className="mt-2 text-gray-600">
              You have declined this proposal. Feel free to reach out to{" "}
              {proposal.venue?.name} if you&apos;d like to discuss other options.
            </p>
          </div>
        )}

        {isExpired && step === "view" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            This proposal expired on {proposal.valid_until}. Please contact{" "}
            {proposal.venue?.name} to request a new one.
          </div>
        )}

        {/* Proposal summary card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Reference</p>
              <p className="font-mono font-semibold">{proposal.reference_number}</p>
            </div>
            {proposal.valid_until && (
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Valid Until</p>
                <p className="font-semibold">{proposal.valid_until}</p>
              </div>
            )}
          </div>

          {/* Event details */}
          <div className="border-t pt-4 grid grid-cols-2 gap-3 text-sm">
            {Boolean(eventSummary.contact_name) && (
              <div>
                <p className="text-gray-500">Contact</p>
                <p className="font-medium">{String(eventSummary.contact_name)}</p>
              </div>
            )}
            {Boolean(eventSummary.event_type) && (
              <div>
                <p className="text-gray-500">Event Type</p>
                <p className="font-medium">{String(eventSummary.event_type)}</p>
              </div>
            )}
            {Boolean(eventSummary.event_date) && (
              <div>
                <p className="text-gray-500">Event Date</p>
                <p className="font-medium">{String(eventSummary.event_date)}</p>
              </div>
            )}
            {Boolean(eventSummary.guest_count) && (
              <div>
                <p className="text-gray-500">Guests</p>
                <p className="font-medium">{String(eventSummary.guest_count)}</p>
              </div>
            )}
          </div>

          {/* Pricing */}
          {lineItems.length > 0 && (
            <div className="border-t pt-4 space-y-2 text-sm">
              <p className="font-semibold text-gray-700">Pricing Breakdown</p>
              {lineItems.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-600">{String(item.label ?? "Item")}</span>
                  <span>${Number(item.amount ?? 0).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between font-bold text-base">
                  <span>Total Estimate</span>
                  <span>${Number(proposal.total_estimated ?? 0).toLocaleString()}</span>
                </div>
                {proposal.deposit_amount && (
                  <div className="flex justify-between text-gray-500">
                    <span>Deposit Required</span>
                    <span>${Number(proposal.deposit_amount).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PDF link */}
          {proposal.pdf_url && (
            <div className="border-t pt-4">
              <a
                href={proposal.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="text-teal-700 hover:underline text-sm font-medium"
              >
                Download Full Proposal PDF →
              </a>
            </div>
          )}
        </div>

        {/* Signature step */}
        {step === "sign" && !isExpired && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Sign to Accept</h2>
            <p className="text-sm text-gray-600">
              By typing your full name below and clicking &quot;Confirm Acceptance&quot;, you agree to
              the proposal terms and authorize {proposal.venue?.name} to proceed.
            </p>
            <div className="space-y-2">
              <Label htmlFor="signature-name">Full Name (Signature)</Label>
              <Input
                id="signature-name"
                placeholder="Type your full name"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                disabled={submitting}
                autoFocus
              />
              <p className="text-xs text-gray-400">
                Signed electronically on {new Date().toLocaleDateString()}
              </p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button
                onClick={handleAccept}
                disabled={submitting || !signatureName.trim()}
                className="bg-teal-700 hover:bg-teal-800"
              >
                {submitting ? "Confirming..." : "Confirm Acceptance"}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setStep("view"); setError(null) }}
                disabled={submitting}
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Primary actions */}
        {step === "view" && !isExpired && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-teal-700 hover:bg-teal-800 py-6 text-base"
              onClick={() => setStep("sign")}
            >
              Accept Proposal
            </Button>
            <Button
              variant="outline"
              className="flex-1 py-6 text-base"
              onClick={handleDecline}
              disabled={submitting}
            >
              {submitting ? "Declining..." : "Decline"}
            </Button>
          </div>
        )}

        {error && step === "view" && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <p className="text-center text-xs text-gray-400">
          Questions? Reply directly to the proposal email from {proposal.venue?.name}.
        </p>
      </div>
    </div>
  )
}
