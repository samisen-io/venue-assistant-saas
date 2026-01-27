import { useState, useEffect, useCallback } from 'react'
import { Event } from '@/lib/types'
import { SpaceAvailability } from '@/lib/types/space.types'

interface UseSpaceAvailabilityParams {
  venueId?: string
  spaceId?: string
  date?: string
  startTime?: string
  endTime?: string
  minCapacity?: number
  excludeEventId?: string
  enabled?: boolean  // Allow disabling the hook
}

/**
 * Hook to check space availability for a given date/time range
 */
export function useSpaceAvailability(params: UseSpaceAvailabilityParams) {
  const {
    venueId,
    spaceId,
    date,
    startTime,
    endTime,
    minCapacity,
    excludeEventId,
    enabled = true,
  } = params

  const [availability, setAvailability] = useState<SpaceAvailability[] | null>(null)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAvailability = useCallback(async () => {
    // Don't fetch if required params are missing or hook is disabled
    if (!enabled || !date || !startTime || !endTime) {
      setAvailability(null)
      setIsAvailable(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Build query string
      const params = new URLSearchParams({
        date,
        startTime,
        endTime,
      })

      if (venueId) params.append('venueId', venueId)
      if (spaceId) params.append('spaceId', spaceId)
      if (minCapacity) params.append('minCapacity', minCapacity.toString())
      if (excludeEventId) params.append('excludeEventId', excludeEventId)

      const response = await fetch(`/api/spaces/availability?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to check space availability')
      }

      const data = await response.json()

      // Handle different response formats
      if (spaceId) {
        // Single space check - returns { spaceId, isAvailable, ... }
        setIsAvailable(data.isAvailable)
        setAvailability(null)
      } else {
        // Multiple spaces check - returns { spaces: [...], ... }
        setAvailability(data.spaces)
        setIsAvailable(null)
      }
    } catch (err) {
      console.error('Error checking space availability:', err)
      setError(err instanceof Error ? err.message : 'Failed to check availability')
      setAvailability(null)
      setIsAvailable(null)
    } finally {
      setLoading(false)
    }
  }, [venueId, spaceId, date, startTime, endTime, minCapacity, excludeEventId, enabled])

  useEffect(() => {
    checkAvailability()
  }, [checkAvailability])

  return {
    availability,      // Array of SpaceAvailability (when checking multiple spaces)
    isAvailable,       // Boolean (when checking single space)
    loading,
    error,
    refetch: checkAvailability,
  }
}

/**
 * Hook to get conflicting events for a specific space
 */
export function useConflictingEvents(
  spaceId: string | null,
  date: string | null,
  startTime: string | null,
  endTime: string | null
) {
  const [conflicts, setConflicts] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConflicts = useCallback(async () => {
    if (!spaceId || !date || !startTime || !endTime) {
      setConflicts([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        spaceId,
        date,
        startTime,
        endTime,
      })

      const response = await fetch(`/api/spaces/availability?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch conflicting events')
      }

      const data = await response.json()

      // If the space is not available, fetch the conflicting events
      // This would require a separate endpoint or enhanced response
      // For now, we'll set empty array
      setConflicts([])
    } catch (err) {
      console.error('Error fetching conflicting events:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch conflicts')
      setConflicts([])
    } finally {
      setLoading(false)
    }
  }, [spaceId, date, startTime, endTime])

  useEffect(() => {
    fetchConflicts()
  }, [fetchConflicts])

  return {
    conflicts,
    loading,
    error,
    refetch: fetchConflicts,
  }
}
