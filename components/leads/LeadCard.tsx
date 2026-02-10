"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Mail, Phone, Users } from "lucide-react"

/* eslint-disable @typescript-eslint/no-explicit-any */

function priorityBadge(score: number) {
  if (score >= 70) return <Badge variant="destructive">High</Badge>
  if (score >= 40) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>
  return <Badge variant="secondary">Low</Badge>
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  qualified: "bg-indigo-100 text-indigo-800",
  proposal_sent: "bg-amber-100 text-amber-800",
  negotiating: "bg-orange-100 text-orange-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
}

export function LeadCard({ lead }: { lead: any }) {
  return (
    <Link href={`/leads/${lead.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold">
                  {lead.contact_name || "Unknown Contact"}
                </h3>
                {priorityBadge(lead.priority_score ?? 0)}
              </div>
              {lead.company && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {lead.company}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-800"}`}
            >
              {(lead.status ?? "new").replace(/_/g, " ")}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {lead.contact_email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {lead.contact_email}
              </span>
            )}
            {lead.contact_phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {lead.contact_phone}
              </span>
            )}
            {lead.guest_count && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {lead.guest_count} guests
              </span>
            )}
            {lead.event_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {lead.event_date}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            {lead.event_type && <Badge variant="outline">{lead.event_type}</Badge>}
            <span className="capitalize">{lead.source?.replace(/_/g, " ") ?? "manual"}</span>
            <span>&middot;</span>
            <span>{new Date(lead.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
