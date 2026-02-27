"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useLead, useUpdateLead } from "@/hooks/useLeads"
import { Loading } from "@/components/shared/Loading"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { LeadStatusDropdown } from "./LeadStatusDropdown"
import { ConversationTranscript } from "./ConversationTranscript"
import { AIInsightsPanel } from "./AIInsightsPanel"
import { ActivityTimeline } from "./ActivityTimeline"
import { ProposalPreview } from "@/components/proposals/ProposalPreview"
import { ProposalStatusBadge } from "@/components/proposals/ProposalStatusBadge"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Building,
  Users,
  CheckCircle,
  FileText,
  ExternalLink,
} from "lucide-react"

/* eslint-disable @typescript-eslint/no-explicit-any */

function priorityLabel(score: number) {
  if (score >= 70) return { label: "High", color: "destructive" as const }
  if (score >= 40) return { label: "Medium", color: "default" as const }
  return { label: "Low", color: "secondary" as const }
}

export function LeadDetail({ leadId }: { leadId: string }) {
  const { data, loading, error, refetch } = useLead(leadId)
  const { updateLead, updating } = useUpdateLead()
  const [isConverting, setIsConverting] = useState(false)
  const [proposal, setProposal] = useState<any>(null)
  const [proposalLoading, setProposalLoading] = useState(true)
  const [creatingProposal, setCreatingProposal] = useState(false)
  const [savingProposal, setSavingProposal] = useState(false)
  const [sendingProposal, setSendingProposal] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchProposal = useCallback(async () => {
    setProposalLoading(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/proposal`)
      if (res.ok) {
        const data = await res.json()
        setProposal(data)
      }
    } catch {
      // no-op
    } finally {
      setProposalLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    fetchProposal()
  }, [fetchProposal])

  const handleCreateProposal = async () => {
    setCreatingProposal(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const created = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: created.error || "Failed to create proposal", variant: "destructive" })
        return
      }
      setProposal(created)
      toast({ title: "Proposal draft created", description: "Edit and send it to the client." })
    } catch {
      toast({ title: "Error", description: "Failed to create proposal", variant: "destructive" })
    } finally {
      setCreatingProposal(false)
    }
  }

  const handleSaveProposal = async (updates: any) => {
    if (!proposal) return
    setSavingProposal(true)
    try {
      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      const updated = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: updated.error || "Failed to save", variant: "destructive" })
        return
      }
      setProposal(updated)
      toast({ title: "Draft saved" })
    } catch {
      toast({ title: "Error", description: "Failed to save proposal", variant: "destructive" })
    } finally {
      setSavingProposal(false)
    }
  }

  const handleSendProposal = async () => {
    if (!proposal) return
    setSendingProposal(true)
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/send`, { method: "POST" })
      const result = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: result.error || "Failed to send", variant: "destructive" })
        return
      }
      setProposal((p: any) => ({ ...p, status: "sent" }))
      refetch()
      toast({ title: "Proposal sent!", description: "The client has been emailed." })
    } catch {
      toast({ title: "Error", description: "Failed to send proposal", variant: "destructive" })
    } finally {
      setSendingProposal(false)
    }
  }

  const proposalPublicUrl =
    proposal?.public_token
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/proposals/${proposal.public_token}`
      : null

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!data) return <ErrorMessage message="Lead not found" />

  const { lead, conversation, messages, activities } = data
  const priority = priorityLabel(lead.priority_score ?? 0)

  const handleStatusChange = async (status: string, lostReason?: string) => {
    const updates: Record<string, unknown> = { status }
    if (lostReason) updates.lost_reason = lostReason
    await updateLead(leadId, updates)
    refetch()
  }

  const handleConvertToEvent = async () => {
    setIsConverting(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/convert-to-event`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to convert lead to event",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Lead converted to event successfully",
      })

      // Redirect to the new event
      router.push(`/events/${data.event_id}`)
    } catch (error) {
      console.error("Error converting lead:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {lead.contact_name || "Unknown Contact"}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {lead.company && (
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {lead.company}
              </span>
            )}
            {lead.event_type && <Badge variant="outline">{lead.event_type}</Badge>}
            <Badge variant={priority.color}>{priority.label} Priority ({lead.priority_score})</Badge>
            <span className="capitalize">{lead.source?.replace(/_/g, " ")}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {lead.status !== "won" && lead.status !== "lost" && (
            <Button
              data-testid="convert-to-event-btn"
              size="sm"
              onClick={handleConvertToEvent}
              disabled={isConverting}
            >
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
              {isConverting ? "Converting..." : "Convert to Event"}
            </Button>
          )}
          {lead.contact_email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${lead.contact_email}`}>
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                Email
              </a>
            </Button>
          )}
          {lead.contact_phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${lead.contact_phone}`}>
                <Phone className="mr-1.5 h-3.5 w-3.5" />
                Call
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Contact & Event details */}
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 text-sm font-semibold">Details</h2>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {lead.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${lead.contact_email}`} className="text-blue-600 hover:underline">
                      {lead.contact_email}
                    </a>
                  </div>
                )}
                {lead.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {lead.contact_phone}
                  </div>
                )}
                {lead.guest_count && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {lead.guest_count} guests
                  </div>
                )}
                {lead.event_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {lead.event_date}
                    {lead.date_is_flexible && " (flexible)"}
                  </div>
                )}
                {lead.estimated_budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    ${Number(lead.estimated_budget).toLocaleString()}
                  </div>
                )}
              </div>
              {lead.notes && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{lead.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Conversation transcript */}
          <ConversationTranscript messages={messages} />

          {/* AI Insights */}
          <AIInsightsPanel
            insights={lead.ai_insights}
            extractedData={conversation?.extracted_data}
          />

          {/* Proposal section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Proposal
              </h2>
              {proposal && proposal.public_token && (
                <a
                  href={proposalPublicUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  Client view
                </a>
              )}
            </div>

            {proposalLoading ? (
              <p className="text-sm text-muted-foreground">Loading proposal...</p>
            ) : proposal ? (
              <div className="space-y-3">
                {proposal.status && (
                  <div className="flex items-center gap-2">
                    <ProposalStatusBadge status={proposal.status} />
                    {proposal.accepted_by_name && (
                      <span className="text-xs text-muted-foreground">
                        Signed by {proposal.accepted_by_name}
                      </span>
                    )}
                  </div>
                )}
                <ProposalPreview
                  proposal={proposal}
                  onSave={handleSaveProposal}
                  onSend={handleSendProposal}
                  saving={savingProposal}
                  sending={sendingProposal}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    No proposal yet. Create one to send pricing details to this lead.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleCreateProposal}
                    disabled={creatingProposal}
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    {creatingProposal ? "Creating..." : "Create Proposal"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Status
                </p>
                <LeadStatusDropdown
                  currentStatus={lead.status}
                  onStatusChange={handleStatusChange}
                  disabled={updating}
                />
              </div>
              {lead.lost_reason && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Lost Reason
                  </p>
                  <p className="mt-0.5 text-sm">{lead.lost_reason}</p>
                </div>
              )}
              <Separator />
              <div className="text-xs text-muted-foreground">
                <p>Created: {new Date(lead.created_at).toLocaleDateString()}</p>
                {lead.updated_at && (
                  <p>Updated: {new Date(lead.updated_at).toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <ActivityTimeline
            activities={activities}
            leadId={leadId}
            onActivityAdded={refetch}
          />
        </div>
      </div>
    </div>
  )
}
