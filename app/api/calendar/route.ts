import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/calendar
 * Fetch events for calendar view with date range and filters
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const venueId = searchParams.get('venueId')
    const spaceId = searchParams.get('spaceId')
    const status = searchParams.get('status')
    const eventType = searchParams.get('eventType')

    // Build query
    let query = supabase
      .from('events')
      .select(
        `
        *,
        venue:venues!events_venue_id_fkey (
          id,
          name,
          address,
          city,
          state
        ),
        space:spaces!events_space_id_fkey (
          id,
          name,
          space_type,
          capacity
        )
      `
      )
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true })

    // Apply date range filter
    if (startDate && endDate) {
      query = query.gte('event_date', startDate).lte('event_date', endDate)
    } else if (startDate) {
      query = query.gte('event_date', startDate)
    } else if (endDate) {
      query = query.lte('event_date', endDate)
    }

    // Apply venue filter
    if (venueId && venueId !== 'all') {
      query = query.eq('venue_id', venueId)
    }

    // Apply space filter
    if (spaceId && spaceId !== 'all') {
      query = query.eq('space_id', spaceId)
    }

    // Apply status filter
    if (status && status !== 'all') {
      const statuses = status.split(',')
      if (statuses.length > 0) {
        query = query.in('status', statuses)
      }
    }

    // Apply event type filter
    if (eventType && eventType !== 'all') {
      const types = eventType.split(',')
      if (types.length > 0) {
        query = query.in('event_type', types)
      }
    }

    const { data: events, error: eventsError } = await query

    if (eventsError) {
      console.error('Error fetching calendar events:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    type EventWithJoins = any // Using any for complex joined queries

    // Get assigned vendors count for each event
    const eventsWithVendorCount = await Promise.all(
      ((events || []) as EventWithJoins[]).map(async (event: EventWithJoins) => {
        const { count } = await supabase
          .from('event_vendors')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('confirmed', true)

        return {
          ...event,
          venue_name: event.venue?.name,
          space_name: event.space?.name,
          assigned_vendors_count: count || 0,
        }
      })
    )

    return NextResponse.json({
      events: eventsWithVendorCount,
      count: eventsWithVendorCount.length,
    })
  } catch (error) {
    console.error('Error in calendar API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
