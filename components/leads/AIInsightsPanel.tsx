"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Brain } from "lucide-react"

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AIInsightsPanelProps {
  insights: any | null
  extractedData: any | null
}

export function AIInsightsPanel({ insights, extractedData }: AIInsightsPanelProps) {
  if (!insights && !extractedData) return null

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Brain className="h-4 w-4 text-purple-600" />
          What the AI Learned
        </div>

        <dl className="mt-3 space-y-2 text-sm">
          {extractedData?.event_type && (
            <div>
              <dt className="text-xs text-muted-foreground">Event Type</dt>
              <dd className="font-medium capitalize">{extractedData.event_type}</dd>
            </div>
          )}
          {extractedData?.guest_count && (
            <div>
              <dt className="text-xs text-muted-foreground">Guest Count</dt>
              <dd className="font-medium">{extractedData.guest_count}</dd>
            </div>
          )}
          {extractedData?.budget && (
            <div>
              <dt className="text-xs text-muted-foreground">Estimated Budget</dt>
              <dd className="font-medium">${Number(extractedData.budget).toLocaleString()}</dd>
            </div>
          )}
          {extractedData?.date && (
            <div>
              <dt className="text-xs text-muted-foreground">Preferred Date</dt>
              <dd className="font-medium">
                {extractedData.date}
                {extractedData.date_flexibility === "flexible" && " (flexible)"}
              </dd>
            </div>
          )}
          {extractedData?.urgency && (
            <div>
              <dt className="text-xs text-muted-foreground">Urgency</dt>
              <dd className="font-medium capitalize">{extractedData.urgency}</dd>
            </div>
          )}
          {insights?.confidence != null && (
            <div>
              <dt className="text-xs text-muted-foreground">Booking Confidence</dt>
              <dd className="font-medium">{Math.round(insights.confidence * 100)}%</dd>
            </div>
          )}
        </dl>

        {extractedData?.requirements && (
          <div className="mt-3 border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground">Requirements</p>
            <ul className="mt-1 space-y-0.5 text-xs">
              {extractedData.requirements.catering && <li>Catering needed</li>}
              {extractedData.requirements.av_setup && <li>AV setup needed</li>}
              {extractedData.requirements.overnight_rooms && <li>Overnight rooms</li>}
              {extractedData.requirements.outdoor_space && <li>Outdoor space</li>}
              {extractedData.requirements.alcohol_service && <li>Alcohol service</li>}
              {Array.isArray(extractedData.requirements.custom) &&
                extractedData.requirements.custom.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
