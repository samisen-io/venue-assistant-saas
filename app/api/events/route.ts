import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { eventFormSchema } from '@/lib/utils/validation'
import { checkSpaceAvailability, getConflictingEvents } from '@/lib/algorithms/space-availability'
import { canCreateEvent } from '@/lib/subscription/limits'
import { trackEventCreation } from '@/lib/subscription/usage'
import { resolveVenueWithFallback } from '@/lib/venues/resolveVenue'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const spaceId = searchParams.get('spaceId')

        let query = supabase
            .from('events')
            .select(`
        *,
        spaces (id, name, capacity, space_type),
        venues (name)
      `)
            .order('event_date', { ascending: true })

        // Filter by space or venue
        if (spaceId) {
            query = query.eq('space_id', spaceId)
        } else {
            const resolved = await resolveVenueWithFallback(request, supabase, user.id)
            if (resolved.error) return NextResponse.json([])
            query = query.eq('venue_id', resolved.venue!.id)
        }

        const { data: events, error } = await query

        if (error) throw error

        return NextResponse.json(events)
    } catch (error) {
        console.error('Error fetching events:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Check subscription limits
        const eventCheck = await canCreateEvent(user.id)
        if (!eventCheck.allowed) {
            return NextResponse.json(
                { error: eventCheck.reason, code: 'LIMIT_REACHED' },
                { status: 403 }
            )
        }

        const json = await request.json()
        // Expect space_id in the request body
        const { space_id, event_end_time, event_service_requirements, ...eventData } = json

        if (!space_id) {
            return new NextResponse('Space ID is required', { status: 400 })
        }

        const body = eventFormSchema.parse(eventData)

        // Get the space to find its venue_id
        const { data: space, error: spaceError } = await (supabase as any)
            .from('spaces')
            .select('venue_id')
            .eq('id', space_id)
            .single()

        if (spaceError || !space) {
            return new NextResponse('Invalid space ID', { status: 400 })
        }

        // Check space availability before creating event
        if (body.event_date && body.event_time) {
            const endTime = event_end_time || addDefaultEndTime(body.event_time)
            const isAvailable = await checkSpaceAvailability({
                spaceId: space_id,
                date: body.event_date,
                startTime: body.event_time,
                endTime,
            })

            if (!isAvailable) {
                const conflicts = await getConflictingEvents(
                    space_id,
                    body.event_date,
                    body.event_time,
                    endTime
                )
                return NextResponse.json(
                    {
                        error: 'Space is already booked for this time',
                        code: 'SPACE_CONFLICT',
                        conflictingEvents: conflicts.map((e: any) => ({
                            id: e.id,
                            event_name: e.event_name,
                            event_date: e.event_date,
                            event_time: e.event_time,
                            event_end_time: e.event_end_time,
                        })),
                    },
                    { status: 409 }
                )
            }
        }

        const insertData: any = {
            ...body,
            space_id: space_id,
            venue_id: space.venue_id,
            status: 'planning',
            budget_spent: 0,
        }
        if (event_end_time) insertData.event_end_time = event_end_time

        let { data: event, error } = await (supabase as any)
            .from('events')
            .insert(insertData)
            .select()
            .single()

        // If insert fails and we included event_end_time, retry without it
        // (handles case where migration hasn't been run yet)
        if (error && 'event_end_time' in insertData) {
            const { event_end_time: _removed, ...insertWithoutEndTime } = insertData
            const retryResult = await (supabase as any)
                .from('events')
                .insert(insertWithoutEndTime)
                .select()
                .single()

            if (retryResult.error) throw retryResult.error
            event = retryResult.data
            error = null
        }

        if (error) throw error

        if (event_service_requirements && event_service_requirements.length > 0) {
            const requirements = event_service_requirements.map((requirement: any) => ({
                event_id: event.id,
                event_service_id: requirement.event_service_id,
                budget_amount: requirement.budget_amount || 0,
            }))

            const { error: requirementsError } = await (supabase as any)
                .from('event_service_requirements')
                .insert(requirements)

            if (requirementsError) throw requirementsError
        }

        // Track usage
        await trackEventCreation(user.id).catch(console.error)

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error creating event:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

function addDefaultEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endHours = (hours + 1) % 24
    return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
}
