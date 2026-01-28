import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { eventFormSchema } from '@/lib/utils/validation'
import { checkSpaceAvailability, getConflictingEvents } from '@/lib/algorithms/space-availability'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const supabase = await createClient()
        const { eventId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: event, error } = await (supabase as any)
            .from('events')
            .select(`
        *,
        spaces (*),
        venues (*),
        clients (*),
        event_vendors (*),
        event_service_requirements (
            id,
            event_service_id,
            budget_amount,
            event_services (id, name, slug)
        )
      `)
            .eq('id', eventId)
            .single()

        if (error) throw error

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error fetching event:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const supabase = await createClient()
        const { eventId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const json = await request.json()
        const { event_service_requirements, event_end_time, ...eventData } = json
        const body = eventFormSchema.partial().parse(eventData)

        // Check space availability if space, date, or time is changing
        const spaceId = eventData.space_id
        const eventDate = body.event_date
        const eventTime = body.event_time

        if (spaceId && eventDate && eventTime) {
            const endTime = event_end_time || addDefaultEndTime(eventTime)
            const isAvailable = await checkSpaceAvailability({
                spaceId,
                date: eventDate,
                startTime: eventTime,
                endTime,
                excludeEventId: eventId, // Exclude this event from conflict check
            })

            if (!isAvailable) {
                const conflicts = await getConflictingEvents(
                    spaceId,
                    eventDate,
                    eventTime,
                    endTime
                )
                return NextResponse.json(
                    {
                        error: 'Space is already booked for this time',
                        code: 'SPACE_CONFLICT',
                        conflictingEvents: conflicts
                            .filter((e: any) => e.id !== eventId)
                            .map((e: any) => ({
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

        const updateData: any = { ...body }
        if (spaceId) updateData.space_id = spaceId
        if (event_end_time !== undefined) updateData.event_end_time = event_end_time || null

        let { data: event, error } = await (supabase as any)
            .from('events')
            .update(updateData)
            .eq('id', eventId)
            .select()
            .single()

        // If update fails and we included event_end_time, retry without it
        // (handles case where migration hasn't been run yet)
        if (error && 'event_end_time' in updateData) {
            const { event_end_time: _removed, ...updateWithoutEndTime } = updateData
            const retryResult = await (supabase as any)
                .from('events')
                .update(updateWithoutEndTime)
                .eq('id', eventId)
                .select()
                .single()

            if (retryResult.error) throw retryResult.error
            event = retryResult.data
            error = null
        }

        if (error) throw error

        if (event_service_requirements) {
            await (supabase as any)
                .from('event_service_requirements')
                .delete()
                .eq('event_id', eventId)

            if (event_service_requirements.length > 0) {
                const requirements = event_service_requirements.map((requirement: any) => ({
                    event_id: eventId,
                    event_service_id: requirement.event_service_id,
                    budget_amount: requirement.budget_amount || 0,
                }))

                const { error: requirementsError } = await (supabase as any)
                    .from('event_service_requirements')
                    .insert(requirements)

                if (requirementsError) throw requirementsError
            }
        }

        return NextResponse.json(event)
    } catch (error: any) {
        console.error('Error updating event:', error)
        const message = error?.message || 'Internal Error'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}

function addDefaultEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endHours = (hours + 1) % 24
    return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const supabase = await createClient()
        const { eventId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { error } = await (supabase as any)
            .from('events')
            .delete()
            .eq('id', eventId)

        if (error) throw error

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting event:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
