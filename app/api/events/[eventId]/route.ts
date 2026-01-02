import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { eventFormSchema } from '@/lib/utils/validation'

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

        const { data: event, error } = await supabase
            .from('events')
            .select(`
        *,
        spaces (*),
        venues (*),
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
        const { event_service_requirements, ...eventData } = json
        // Separate update logic if needed, but for now reuse schema
        const body = eventFormSchema.partial().parse(eventData)

        const { data: event, error } = await supabase
            .from('events')
            .update(body)
            .eq('id', eventId)
            .select()
            .single()

        if (error) throw error

        if (event_service_requirements) {
            await supabase
                .from('event_service_requirements')
                .delete()
                .eq('event_id', eventId)

            if (event_service_requirements.length > 0) {
                const requirements = event_service_requirements.map((requirement: any) => ({
                    event_id: eventId,
                    event_service_id: requirement.event_service_id,
                    budget_amount: requirement.budget_amount || 0,
                }))

                const { error: requirementsError } = await supabase
                    .from('event_service_requirements')
                    .insert(requirements)

                if (requirementsError) throw requirementsError
            }
        }

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error updating event:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
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

        const { error } = await supabase
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
