import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import {
  CalendarEventWithVenue,
  CalendarEvent,
  DateRange,
  EventStatus,
} from '@/lib/types'
import { convertToCalendarEvents } from '@/lib/utils/calendar'

interface UseCalendarEventsOptions {
  dateRange: DateRange
  venueId?: string
  spaceId?: string
  status?: EventStatus[]
  eventType?: string[]
}

export function useCalendarEvents({
  dateRange,
  venueId,
  spaceId,
  status,
  eventType,
}: UseCalendarEventsOptions) {
  const [events, setEvents] = useState<CalendarEventWithVenue[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      params.append('startDate', format(dateRange.start, 'yyyy-MM-dd'))
      params.append('endDate', format(dateRange.end, 'yyyy-MM-dd'))

      if (venueId && venueId !== 'all') {
        params.append('venueId', venueId)
      }

      if (spaceId && spaceId !== 'all') {
        params.append('spaceId', spaceId)
      }

      if (status && status.length > 0) {
        params.append('status', status.join(','))
      }

      if (eventType && eventType.length > 0) {
        params.append('eventType', eventType.join(','))
      }

      const response = await fetch(`/api/calendar?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      const fetchedEvents = data.events || []

      setEvents(fetchedEvents)

      // Convert to calendar events
      const converted = convertToCalendarEvents(fetchedEvents)
      setCalendarEvents(converted)
    } catch (err) {
      console.error('Error fetching calendar events:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setIsLoading(false)
    }
  }, [dateRange, venueId, spaceId, status, eventType])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const refetch = useCallback(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    events,
    calendarEvents,
    isLoading,
    error,
    refetch,
  }
}
