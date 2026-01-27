import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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

        // Fetch the event to verify it exists and isn't already cancelled
        const { data: existingEvent, error: fetchError } = await (supabase as any)
            .from('events')
            .select('id, status')
            .eq('id', eventId)
            .single()

        if (fetchError || !existingEvent) {
            return new NextResponse('Event not found', { status: 404 })
        }

        if (existingEvent.status === 'cancelled') {
            return NextResponse.json(
                { error: 'Event is already cancelled' },
                { status: 400 }
            )
        }

        // Update event status to cancelled — this releases the space
        // because cancelled events are excluded from conflict checks
        const { data: event, error } = await (supabase as any)
            .from('events')
            .update({ status: 'cancelled' })
            .eq('id', eventId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({
            message: 'Event cancelled successfully. Space has been released.',
            event,
        })
    } catch (error) {
        console.error('Error cancelling event:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
