'use client'

import { useEffect, useState } from 'react'
import type { AnalyticsOverview } from '@/lib/types/analytics.types'

export function useAnalytics(venueId: string, range: string = '30d', start?: string, end?: string) {
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({ range })
        if (start) params.append('start', start)
        if (end) params.append('end', end)

        const res = await fetch(`/api/venues/${venueId}/analytics?${params}`)
        if (!res.ok) throw new Error('Failed to fetch analytics')

        const result = await res.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [venueId, range, start, end])

  return { data, loading, error }
}
