import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  isWithinInterval,
  isSameDay,
  parseISO,
  addHours,
} from 'date-fns'
import {
  Event,
  EventStatus,
  CalendarEventWithVenue,
  CalendarEvent,
  DateRange,
  TimeSlot,
  EventColorConfig,
} from '@/lib/types'

/**
 * Format a date for calendar display
 */
export function formatCalendarDate(date: Date, formatStr: string = 'PPP'): string {
  return format(date, formatStr)
}

/**
 * Get the start and end bounds for a day view
 */
export function getDayBounds(date: Date): DateRange {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  }
}

/**
 * Get the start and end bounds for a week view
 * Week starts on Sunday by default
 */
export function getWeekBounds(date: Date): DateRange {
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 }),
  }
}

/**
 * Get the start and end bounds for a month view
 */
export function getMonthBounds(date: Date): DateRange {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

/**
 * Check if an event falls within a date range
 */
export function isEventInDateRange(
  event: Event,
  startDate: Date,
  endDate: Date
): boolean {
  const eventDate = typeof event.event_date === 'string'
    ? parseISO(event.event_date)
    : new Date(event.event_date)

  return isWithinInterval(eventDate, { start: startDate, end: endDate })
}

/**
 * Get color configuration for an event based on its status
 */
export function getEventColor(status: EventStatus): EventColorConfig {
  const colorMap: Record<EventStatus, EventColorConfig> = {
    planning: {
      status: 'planning',
      backgroundColor: '#e2e8f0', // slate-200
      borderColor: '#64748b', // slate-500
      textColor: '#1e293b', // slate-800
    },
    confirmed: {
      status: 'confirmed',
      backgroundColor: '#dbeafe', // blue-100
      borderColor: '#2563eb', // blue-600
      textColor: '#1e3a8a', // blue-900
    },
    in_progress: {
      status: 'in_progress',
      backgroundColor: '#fef3c7', // amber-100
      borderColor: '#d97706', // amber-600
      textColor: '#78350f', // amber-900
    },
    completed: {
      status: 'completed',
      backgroundColor: '#dcfce7', // green-100
      borderColor: '#16a34a', // green-600
      textColor: '#14532d', // green-900
    },
    cancelled: {
      status: 'cancelled',
      backgroundColor: '#fee2e2', // red-100
      borderColor: '#dc2626', // red-600
      textColor: '#7f1d1d', // red-900
    },
  }

  return colorMap[status] || colorMap.planning
}

/**
 * Group events by space ID
 */
export function groupEventsBySpace(
  events: CalendarEventWithVenue[]
): Map<string, CalendarEventWithVenue[]> {
  const grouped = new Map<string, CalendarEventWithVenue[]>()

  events.forEach((event) => {
    const spaceId = event.space_id || 'no-space'
    if (!grouped.has(spaceId)) {
      grouped.set(spaceId, [])
    }
    grouped.get(spaceId)!.push(event)
  })

  return grouped
}

/**
 * Check if two events have a time conflict
 */
export function checkSpaceConflict(event1: Event, event2: Event): boolean {
  // Events must be on the same space and same day
  if (event1.space_id !== event2.space_id) return false

  const date1 = typeof event1.event_date === 'string'
    ? parseISO(event1.event_date)
    : new Date(event1.event_date)
  const date2 = typeof event2.event_date === 'string'
    ? parseISO(event2.event_date)
    : new Date(event2.event_date)

  if (!isSameDay(date1, date2)) return false

  // Parse times (format: "HH:MM:SS" or "HH:MM")
  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const time1 = event1.event_time || '12:00'
  const time2 = event2.event_time || '12:00'
  const start1 = parseTime(time1)
  const end1 = start1 + 240 // Default 4 hours duration
  const start2 = parseTime(time2)
  const end2 = start2 + 240 // Default 4 hours duration

  // Check for overlap
  return start1 < end2 && start2 < end1
}

/**
 * Get available time slots for a space on a specific date
 */
export function getAvailableTimeSlots(
  date: Date,
  events: Event[],
  slotDuration: number = 60 // minutes
): TimeSlot[] {
  const dayStart = startOfDay(date)
  const slots: TimeSlot[] = []

  // Generate slots from 6 AM to 11 PM
  for (let hour = 6; hour < 23; hour++) {
    const slotStart = addHours(dayStart, hour)
    const slotEnd = addHours(slotStart, slotDuration / 60)

    // Check if this slot conflicts with any event
    const hasConflict = events.some((event) => {
      const eventDate = typeof event.event_date === 'string'
        ? parseISO(event.event_date)
        : new Date(event.event_date)

      if (!isSameDay(eventDate, date)) return false

      const parseTime = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number)
        return hours * 60 + minutes
      }

      const eventTime = event.event_time || '12:00'
      const eventStart = parseTime(eventTime)
      const eventEnd = eventStart + 240 // Default 4 hours

      const slotStartMinutes = hour * 60
      const slotEndMinutes = slotStartMinutes + slotDuration

      return slotStartMinutes < eventEnd && eventStart < slotEndMinutes
    })

    const conflictingEvent = events.find((event) => {
      const eventDate = typeof event.event_date === 'string'
        ? parseISO(event.event_date)
        : new Date(event.event_date)

      if (!isSameDay(eventDate, date)) return false

      const parseTime = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number)
        return hours * 60 + minutes
      }

      const eventTime = event.event_time || '12:00'
      const eventStart = parseTime(eventTime)
      const eventEnd = eventStart + 240 // Default 4 hours
      const slotStartMinutes = hour * 60
      const slotEndMinutes = slotStartMinutes + slotDuration

      return slotStartMinutes < eventEnd && eventStart < slotEndMinutes
    })

    slots.push({
      start: slotStart,
      end: slotEnd,
      available: !hasConflict,
      event_id: conflictingEvent?.id,
    })
  }

  return slots
}

/**
 * Convert database events to calendar events for react-big-calendar
 */
export function convertToCalendarEvents(
  events: CalendarEventWithVenue[]
): CalendarEvent[] {
  return events.map((event) => {
    const eventDate = typeof event.event_date === 'string'
      ? parseISO(event.event_date)
      : new Date(event.event_date)

    // Parse event time
    const eventTime = event.event_time || '12:00'
    const [startHours, startMinutes] = eventTime.split(':').map(Number)
    const start = new Date(eventDate)
    start.setHours(startHours, startMinutes, 0, 0)

    // Use event_end_time if available, otherwise default to 4 hours
    let end: Date
    const endTimeStr = (event as any).event_end_time
    if (endTimeStr) {
      const [endHours, endMinutes] = endTimeStr.split(':').map(Number)
      end = new Date(eventDate)
      end.setHours(endHours, endMinutes, 0, 0)
    } else {
      end = addHours(start, 4)
    }

    // Include space name in title for calendar display
    const spaceName = event.space_name || (event.space as any)?.name
    const title = spaceName
      ? `${event.event_name} (${spaceName})`
      : event.event_name

    return {
      id: event.id,
      title,
      start,
      end,
      resource: event,
      status: event.status as EventStatus,
      venue_id: event.venue_id,
      space_id: event.space_id,
      allDay: false,
    }
  })
}

/**
 * Get CSS class names for event styling
 */
export function getEventClassName(event: CalendarEvent): string {
  const status = event.status || 'planning'
  const colorConfig = getEventColor(status)

  return `calendar-event calendar-event-${status}`
}

/**
 * Format time range for display
 */
export function formatTimeRange(start: Date, end: Date): string {
  return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}
