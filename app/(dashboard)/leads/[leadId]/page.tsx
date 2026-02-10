"use client"

import { useParams } from "next/navigation"
import { LeadDetail } from "@/components/leads/LeadDetail"
import { Breadcrumbs } from "@/components/shared/Breadcrumbs"

export default function LeadDetailPage() {
  const params = useParams()
  const leadId = params?.leadId as string

  if (!leadId) return null

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Leads", href: "/leads" },
          { label: "Lead Details" },
        ]}
      />
      <LeadDetail leadId={leadId} />
    </div>
  )
}
