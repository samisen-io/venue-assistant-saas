import { Space, Venue, Event } from './index'

/**
 * Space with venue details included
 */
export interface SpaceWithVenue extends Space {
  venue: Venue
}

/**
 * Time slot for space availability
 */
export interface TimeSlot {
  start: string  // ISO time string (HH:mm:ss)
  end: string    // ISO time string (HH:mm:ss)
  available: boolean
}

/**
 * Space availability information
 */
export interface SpaceAvailability {
  space: Space
  isAvailable: boolean
  conflictingEvents: Event[]
  nextAvailableSlot?: TimeSlot
}

/**
 * Space booking information (minimal event details for bookings)
 */
export interface SpaceBooking {
  id: string
  eventName: string
  eventDate: string
  eventTime: string
  eventEndTime?: string | null
  status: string
  guestCount?: number | null
}

/**
 * Filter options for spaces
 */
export interface SpaceFilter {
  venueId?: string
  spaceType?: string
  minCapacity?: number
  maxCapacity?: number
  isActive?: boolean
  amenities?: string[]
}

/**
 * Space utilization metrics
 */
export interface SpaceUtilization {
  spaceId: string
  spaceName: string
  totalHours: number
  bookedHours: number
  utilizationPercentage: number
  eventCount: number
}

/**
 * Availability check parameters
 */
export interface AvailabilityCheckParams {
  spaceId: string
  date: string  // ISO date string (YYYY-MM-DD)
  startTime: string  // ISO time string (HH:mm:ss)
  endTime: string  // ISO time string (HH:mm:ss)
  excludeEventId?: string  // Optional: exclude this event ID (for updates)
}

/**
 * Find available spaces parameters
 */
export interface FindAvailableSpacesParams {
  venueId: string
  date: string
  startTime: string
  endTime: string
  minCapacity?: number
}
