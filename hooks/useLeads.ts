"use client"

import { useState, useEffect, useCallback } from "react"
import { useVenueContext } from "@/lib/context/VenueContext"
import { withVenueHeader } from "@/lib/utils/venueHeader"

/* eslint-disable @typescript-eslint/no-explicit-any */

interface LeadFilters {
  venueId?: string
  status?: string
  source?: string
  search?: string
  sortBy?: string
  sortOrder?: string
}

export function useLeads(filters?: LeadFilters) {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.status) params.set("status", filters.status)
      if (filters?.source) params.set("source", filters.source)
      if (filters?.search) params.set("search", filters.search)
      if (filters?.sortBy) params.set("sortBy", filters.sortBy)
      if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder)

      const headers = withVenueHeader(filters?.venueId)

      const res = await fetch(`/api/leads?${params.toString()}`, { headers })
      if (!res.ok) throw new Error("Failed to fetch leads")

      const data = await res.json()
      setLeads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [filters?.venueId, filters?.status, filters?.source, filters?.search, filters?.sortBy, filters?.sortOrder])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  return { leads, loading, error, refetch: fetchLeads }
}

export function useLead(leadId: string | null) {
  const { activeVenue } = useVenueContext()
  const [data, setData] = useState<{
    lead: any
    conversation: any
    messages: any[]
    activities: any[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLead = useCallback(async () => {
    if (!leadId) return
    try {
      setLoading(true)
      setError(null)

      const headers = withVenueHeader(activeVenue?.id)

      const res = await fetch(`/api/leads/${leadId}`, { headers })
      if (!res.ok) throw new Error("Failed to fetch lead")

      const result = await res.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [leadId, activeVenue?.id])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  return { data, loading, error, refetch: fetchLead }
}

export function useUpdateLead() {
  const { activeVenue } = useVenueContext()
  const [updating, setUpdating] = useState(false)

  const updateLead = useCallback(
    async (leadId: string, updates: Record<string, unknown>) => {
      setUpdating(true)
      try {
        const headers: HeadersInit = { "Content-Type": "application/json", ...withVenueHeader(activeVenue?.id) }

        const res = await fetch(`/api/leads/${leadId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(updates),
        })
        if (!res.ok) throw new Error("Failed to update lead")
        return await res.json()
      } finally {
        setUpdating(false)
      }
    },
    [activeVenue?.id]
  )

  return { updateLead, updating }
}

export function useAddActivity() {
  const { activeVenue } = useVenueContext()
  const addActivity = useCallback(
    async (leadId: string, activityType: string, description: string) => {
      const headers: HeadersInit = { "Content-Type": "application/json", ...withVenueHeader(activeVenue?.id) }

      const res = await fetch(`/api/leads/${leadId}/activities`, {
        method: "POST",
        headers,
        body: JSON.stringify({ activity_type: activityType, description }),
      })
      if (!res.ok) throw new Error("Failed to add activity")
      return await res.json()
    },
    [activeVenue?.id]
  )

  return { addActivity }
}
