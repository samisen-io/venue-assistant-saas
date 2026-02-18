"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { useLeads } from "@/hooks/useLeads"
import { useVenueContext } from "@/lib/context/VenueContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LeadCard } from "./LeadCard"
import { LeadTable } from "./LeadTable"
import { Loading } from "@/components/shared/Loading"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { MobileFilters } from "@/components/shared/MobileFilters"
import { ViewToggle, ViewMode } from "@/components/shared/ViewToggle"
import { useIsMobile } from "@/hooks/use-mobile"

export function LeadList() {
  const [status, setStatus] = useState("all")
  const [source, setSource] = useState("all")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const isMobile = useIsMobile()
  const { activeVenue } = useVenueContext()
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (globalThis.window !== undefined) {
      return (localStorage.getItem("viewMode:leads") as ViewMode) || "grid"
    }
    return "grid"
  })

  const activeFilterCount =
    (status !== "all" ? 1 : 0) +
    (source !== "all" ? 1 : 0) +
    (search ? 1 : 0)

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem("viewMode:leads", mode)
  }

  const { leads, loading, error, refetch } = useLeads({
    venueId: activeVenue?.id,
    status: status !== "all" ? status : undefined,
    source: source !== "all" ? source : undefined,
    search: search || undefined,
    sortBy,
    sortOrder: "desc",
  })

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <div className="flex items-center gap-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
          <Button asChild>
            <Link href="/leads/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Link>
          </Button>
        </div>
      </div>

      <MobileFilters activeFilterCount={activeFilterCount}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, email, company..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
              <SelectItem value="negotiating">Negotiating</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="ai_chat">AI Chat</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Newest</SelectItem>
              <SelectItem value="priority_score">Priority</SelectItem>
              <SelectItem value="event_date">Event Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </MobileFilters>

      {leads.length === 0 ? (
        <EmptyState
          title="No leads yet"
          description={
            activeFilterCount > 0
              ? "No leads match your current filters."
              : "Leads from AI chat conversations and manual entries will appear here."
          }
          actionLabel={activeFilterCount > 0 ? undefined : "Add Lead"}
          actionHref={activeFilterCount > 0 ? undefined : "/leads/new"}
        />
      ) : isMobile || viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <LeadTable leads={leads} />
      )}
    </div>
  )
}
