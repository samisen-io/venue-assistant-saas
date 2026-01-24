import { Event, Venue, Space, EventStatus } from './index'

/**
 * Calendar view modes
 */
export type CalendarView = 'day' | 'week' | 'month'

/**
 * Date range for filtering calendar events
 */
export type DateRange = {
  start: Date
  end: Date
}

/**
 * Calendar event with venue and space information
 * Extends the base Event type with additional calendar-specific fields
 */
export type CalendarEventWithVenue = Event & {
  venue?: Venue
  space?: Space
  venue_name?: string
  space_name?: string
  assigned_vendors_count?: number
}

/**
 * Calendar event formatted for react-big-calendar
 */
export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource?: CalendarEventWithVenue
  status?: EventStatus
  venue_id?: string | null
  space_id?: string | null
  allDay?: boolean
}

/**
 * Filters for calendar events
 */
export type CalendarFilter = {
  venueId?: string
  spaceId?: string
  status?: EventStatus[]
  eventType?: string[]
  searchQuery?: string
}

/**
 * Space availability status
 */
export type SpaceAvailability = {
  space_id: string
  space_name: string
  date: string
  availability: 'available' | 'partially_booked' | 'fully_booked'
  booked_slots: {
    start: string
    end: string
    event_id: string
    event_name: string
  }[]
}

/**
 * Time slot for availability checking
 */
export type TimeSlot = {
  start: Date
  end: Date
  available: boolean
  event_id?: string
}

/**
 * Calendar event color configuration
 */
export type EventColorConfig = {
  status: EventStatus
  backgroundColor: string
  borderColor: string
  textColor: string
}

/**
 * Calendar navigation direction
 */
export type NavigationDirection = 'prev' | 'next' | 'today'

/**
 * Calendar toolbar actions
 */
export type CalendarAction =
  | { type: 'VIEW_CHANGE'; view: CalendarView }
  | { type: 'DATE_CHANGE'; date: Date }
  | { type: 'NAVIGATE'; direction: NavigationDirection }
  | { type: 'FILTER_CHANGE'; filter: CalendarFilter }
  | { type: 'EVENT_CLICK'; eventId: string }
  | { type: 'SLOT_SELECT'; start: Date; end: Date; spaceId?: string }

/**
 * Calendar state
 */
export type CalendarState = {
  view: CalendarView
  currentDate: Date
  dateRange: DateRange
  filter: CalendarFilter
  selectedEvent?: CalendarEventWithVenue
  isLoading: boolean
  error?: string
}
