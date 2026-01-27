import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findAvailableSpaces, checkSpaceAvailability } from '@/lib/algorithms/space-availability'

/**
 * GET /api/spaces/availability
 *
 * Check space availability for a given date/time range
 *
 * Query params:
 * - venueId: UUID of the venue (optional, defaults to user's venue)
 * - date: Date in YYYY-MM-DD format
 * - startTime: Time in HH:mm:ss format
 * - endTime: Time in HH:mm:ss format
 * - minCapacity: Minimum capacity required (optional)
 * - spaceId: Specific space ID to check (optional)
 * - excludeEventId: Event ID to exclude from conflict check (optional, for updates)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venueId')
    const spaceId = searchParams.get('spaceId')
    const date = searchParams.get('date')
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')
    const minCapacity = searchParams.get('minCapacity')
    const excludeEventId = searchParams.get('excludeEventId')

    // Validate required parameters
    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required parameters: date, startTime, endTime' },
        { status: 400 }
      )
    }

    // Get user's venue if venueId not provided
    let targetVenueId = venueId
    if (!targetVenueId) {
      const { data: venue } = await (supabase as any)
        .from('venues')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!venue) {
        return NextResponse.json(
          { error: 'No venue found for user' },
          { status: 404 }
        )
      }

      targetVenueId = venue.id
    }

    // If checking specific space, return simple boolean
    if (spaceId) {
      const isAvailable = await checkSpaceAvailability({
        spaceId,
        date,
        startTime,
        endTime,
        excludeEventId: excludeEventId || undefined,
      })

      return NextResponse.json({
        spaceId,
        isAvailable,
        date,
        startTime,
        endTime,
      })
    }

    // Otherwise, find all available spaces for the venue
    const availableSpaces = await findAvailableSpaces({
      venueId: targetVenueId!,
      date,
      startTime,
      endTime,
      minCapacity: minCapacity ? parseInt(minCapacity) : undefined,
    })

    return NextResponse.json({
      venueId: targetVenueId,
      date,
      startTime,
      endTime,
      spaces: availableSpaces,
      availableCount: availableSpaces.filter(s => s.isAvailable).length,
      totalCount: availableSpaces.length,
    })
  } catch (error) {
    console.error('Error checking space availability:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
