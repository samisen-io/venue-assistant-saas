import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { eventFormSchema } from '@/lib/utils/validation'

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
            // Get user's venue
            const { data: venue } = await (supabase as any)
                .from('venues')
                .select('id')
                .eq('owner_id', user.id)
                .single()

            if (!venue) {
                return NextResponse.json([]) // No venue, no events
            }

            // Get all events for user's venue (RLS will also filter)
            query = query.eq('venue_id', venue.id)
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

        const json = await request.json()
        // Expect space_id in the request body
        const { space_id, event_service_requirements, ...eventData } = json

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

        const { data: event, error } = await (supabase as any)
            .from('events')
            .insert({
                ...body,
                space_id: space_id,
                venue_id: space.venue_id, // Populate from space
                status: 'planning', // Default status
                budget_spent: 0
            })
            .select()
            .single()

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

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error creating event:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
