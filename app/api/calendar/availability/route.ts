import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSameDay, parseISO } from 'date-fns'
import { Event, Space } from '@/lib/types'

/**
 * GET /api/calendar/availability
 * Check space availability for a specific date and time
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const venueId = searchParams.get('venueId')
    const date = searchParams.get('date')
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')
    const spaceId = searchParams.get('spaceId')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Get all spaces for the venue (or specific space)
    let spacesQuery = supabase
      .from('spaces')
      .select('*')
      .order('name')

    if (venueId) {
      spacesQuery = spacesQuery.eq('venue_id', venueId)
    }

    if (spaceId) {
      spacesQuery = spacesQuery.eq('id', spaceId)
    }

    const { data: spaces, error: spacesError } = await spacesQuery.returns<Space[]>()

    if (spacesError) {
      console.error('Error fetching spaces:', spacesError)
      return NextResponse.json(
        { error: 'Failed to fetch spaces' },
        { status: 500 }
      )
    }

    // Get events for the specified date
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('event_date', date)
      .in('status', ['planning', 'confirmed', 'in_progress'])
      .returns<Event[]>()

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // Calculate availability for each space
    const availability = (spaces || []).map((space) => {
      const spaceEvents = (events || []).filter((e) => e.space_id === space.id)

      // Check for conflicts if specific time is provided
      let hasConflict = false
      if (startTime && endTime) {
        hasConflict = spaceEvents.some((event) => {
          const parseTime = (time: string): number => {
            const [hours, minutes] = time.split(':').map(Number)
            return hours * 60 + minutes
          }

          const eventTime = event.event_time || '12:00'
          const eventStart = parseTime(eventTime)
          const eventEnd = eventStart + 240 // Default 4 hours
          const requestedStart = parseTime(startTime)
          const requestedEnd = parseTime(endTime)

          return requestedStart < eventEnd && eventStart < requestedEnd
        })
      }

      // Determine availability status
      let availabilityStatus: 'available' | 'partially_booked' | 'fully_booked'
      if (spaceEvents.length === 0) {
        availabilityStatus = 'available'
      } else if (spaceEvents.length >= 3) {
        // Arbitrary threshold for "fully booked"
        availabilityStatus = 'fully_booked'
      } else {
        availabilityStatus = 'partially_booked'
      }

      return {
        space_id: space.id,
        space_name: space.name,
        date,
        availability: availabilityStatus,
        has_conflict: hasConflict,
        booked_slots: spaceEvents.map((event) => ({
          start: event.event_time || '',
          end: '', // No end time in schema, using default 4 hour duration
          event_id: event.id,
          event_name: event.event_name,
        })),
      }
    })

    return NextResponse.json({
      availability,
      date,
    })
  } catch (error) {
    console.error('Error in availability API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
