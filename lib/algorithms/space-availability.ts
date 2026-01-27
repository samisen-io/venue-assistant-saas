import { createClient } from '@/lib/supabase/server'
import { Event, Space } from '@/lib/types'
import {
  AvailabilityCheckParams,
  FindAvailableSpacesParams,
  SpaceAvailability,
  TimeSlot,
} from '@/lib/types/space.types'

/**
 * Check if a space is available for the given time slot
 */
export async function checkSpaceAvailability(
  params: AvailabilityCheckParams
): Promise<boolean> {
  const supabase = await createClient()
  const { spaceId, date, startTime, endTime, excludeEventId } = params

  // Query for conflicting events
  let query = (supabase as any)
    .from('events')
    .select('*')
    .eq('space_id', spaceId)
    .eq('event_date', date)
    .neq('status', 'cancelled')

  // Exclude specific event if provided (for updates)
  if (excludeEventId) {
    query = query.neq('id', excludeEventId)
  }

  const { data: events, error } = await query

  if (error) {
    console.error('Error checking space availability:', error)
    throw error
  }

  // Check for time overlaps
  const hasConflict = events?.some((event: any) => {
    const eventStart = event.event_time
    const eventEnd = event.event_end_time || addHours(event.event_time, 1)

    return doTimeRangesOverlap(startTime, endTime, eventStart, eventEnd)
  })

  return !hasConflict
}

/**
 * Get all conflicting events for a given space and time range
 */
export async function getConflictingEvents(
  spaceId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<Event[]> {
  const supabase = await createClient()

  const { data: events, error } = await (supabase as any)
    .from('events')
    .select('*')
    .eq('space_id', spaceId)
    .eq('event_date', date)
    .neq('status', 'cancelled')

  if (error) {
    console.error('Error getting conflicting events:', error)
    return []
  }

  // Filter events that overlap with the given time range
  const conflicting = events?.filter((event: any) => {
    const eventStart = event.event_time
    const eventEnd = event.event_end_time || addHours(event.event_time, 1)

    return doTimeRangesOverlap(startTime, endTime, eventStart, eventEnd)
  })

  return conflicting || []
}

/**
 * Find all available spaces for a venue at a given date/time
 */
export async function findAvailableSpaces(
  params: FindAvailableSpacesParams
): Promise<SpaceAvailability[]> {
  const supabase = await createClient()
  const { venueId, date, startTime, endTime, minCapacity } = params

  // Get all active spaces for the venue
  let query = (supabase as any)
    .from('spaces')
    .select('*')
    .eq('venue_id', venueId)
    .eq('is_active', true)

  if (minCapacity) {
    query = query.gte('capacity', minCapacity)
  }

  const { data: spaces, error } = await query

  if (error) {
    console.error('Error finding available spaces:', error)
    return []
  }

  // Check availability for each space
  const availabilityPromises = spaces.map(async (space: Space) => {
    const conflictingEvents = await getConflictingEvents(
      space.id,
      date,
      startTime,
      endTime
    )

    const isAvailable = conflictingEvents.length === 0

    return {
      space,
      isAvailable,
      conflictingEvents,
    }
  })

  return await Promise.all(availabilityPromises)
}

/**
 * Calculate space utilization percentage for a date range
 */
export async function getSpaceUtilization(
  spaceId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const supabase = await createClient()

  // Get all non-cancelled events for the space in the date range
  const { data: events, error } = await (supabase as any)
    .from('events')
    .select('event_date, event_time, event_end_time')
    .eq('space_id', spaceId)
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .neq('status', 'cancelled')

  if (error || !events) {
    console.error('Error calculating space utilization:', error)
    return 0
  }

  // Calculate total hours booked
  let totalBookedHours = 0
  events.forEach((event: any) => {
    const start = event.event_time
    const end = event.event_end_time || addHours(start, 1)
    const duration = calculateDurationHours(start, end)
    totalBookedHours += duration
  })

  // Calculate total available hours in the date range
  const days = calculateDaysBetween(startDate, endDate)
  const totalAvailableHours = days * 24 // Assume 24-hour availability

  // Calculate utilization percentage
  const utilizationPercentage = (totalBookedHours / totalAvailableHours) * 100

  return Math.round(utilizationPercentage * 100) / 100 // Round to 2 decimal places
}

/**
 * Get the next available time slot for a space after a given date
 */
export async function getNextAvailableSlot(
  spaceId: string,
  afterDate: string
): Promise<TimeSlot | null> {
  const supabase = await createClient()

  // Get upcoming events for the space
  const { data: events, error } = await (supabase as any)
    .from('events')
    .select('event_date, event_time, event_end_time')
    .eq('space_id', spaceId)
    .gte('event_date', afterDate)
    .neq('status', 'cancelled')
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })
    .limit(10) // Get next 10 events to find gaps

  if (error) {
    console.error('Error getting next available slot:', error)
    return null
  }

  if (!events || events.length === 0) {
    // No upcoming events, space is available
    return {
      start: '09:00:00',
      end: '17:00:00',
      available: true,
    }
  }

  // Find first gap that's at least 1 hour
  // This is simplified - you might want more sophisticated logic
  for (let i = 0; i < events.length - 1; i++) {
    const currentEventEnd =
      events[i].event_end_time || addHours(events[i].event_time, 1)
    const nextEventStart = events[i + 1].event_time

    const gapHours = calculateDurationHours(currentEventEnd, nextEventStart)

    if (gapHours >= 1) {
      return {
        start: currentEventEnd,
        end: nextEventStart,
        available: true,
      }
    }
  }

  // No gaps found, return null
  return null
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if two time ranges overlap
 */
function doTimeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  // Convert times to minutes since midnight for easier comparison
  const s1 = timeToMinutes(start1)
  const e1 = timeToMinutes(end1)
  const s2 = timeToMinutes(start2)
  const e2 = timeToMinutes(end2)

  // Ranges overlap if:
  // - start1 is during range2, OR
  // - end1 is during range2, OR
  // - range1 completely contains range2
  return (s1 >= s2 && s1 < e2) || (e1 > s2 && e1 <= e2) || (s1 <= s2 && e1 >= e2)
}

/**
 * Convert time string (HH:mm:ss) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Add hours to a time string
 */
function addHours(time: string, hours: number): string {
  const minutes = timeToMinutes(time)
  const newMinutes = minutes + hours * 60
  const newHours = Math.floor(newMinutes / 60) % 24
  const newMins = newMinutes % 60

  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}:00`
}

/**
 * Calculate duration in hours between two time strings
 */
function calculateDurationHours(start: string, end: string): number {
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  const durationMinutes = endMinutes - startMinutes
  return durationMinutes / 60
}

/**
 * Calculate number of days between two dates
 */
function calculateDaysBetween(start: string, end: string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // Include both start and end dates
}
