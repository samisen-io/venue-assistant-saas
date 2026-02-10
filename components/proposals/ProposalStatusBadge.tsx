import { Badge } from "@/components/ui/badge"
import type { ProposalStatus } from "@/lib/types/proposal.types"

const statusConfig: Record<
  ProposalStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "default" },
  viewed: { label: "Viewed", variant: "outline" },
  accepted: { label: "Accepted", variant: "default" },
  declined: { label: "Declined", variant: "destructive" },
  expired: { label: "Expired", variant: "secondary" },
}

export function ProposalStatusBadge({
  status,
}: {
  status: ProposalStatus | null | undefined
}) {
  const normalized = (status ?? "draft") as ProposalStatus
  const config = statusConfig[normalized] ?? statusConfig.draft
  return <Badge variant={config.variant}>{config.label}</Badge>
}

