"use client"

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
import {
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Building,
  Users,
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

        <div className="flex gap-2">
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
