import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/events/[eventId]/vendors/[associationId]/communications
 *
 * Fetch all communications for a specific event-vendor pair.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ eventId: string; associationId: string }> }
) {
    try {
        const supabase = await createClient()
        const { eventId, associationId } = await params

        // Verify user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Get the event-vendor association to verify ownership and get vendor_id
        const { data: association, error: assocError } = await supabase
            .from('event_vendors')
            .select(`
                vendor_id,
                events (
                    venue_id,
                    venues (owner_id)
                )
            `)
            .eq('id', associationId)
            .single()

        if (assocError || !association) {
            return new NextResponse('Event-vendor association not found', { status: 404 })
        }

        // Verify ownership
        const assocData = association as any
        const venue = assocData.events?.venues
        if (!venue || venue.owner_id !== user.id) {
            return new NextResponse('Unauthorized', { status: 403 })
        }

        // Fetch communications - either by event_vendor_id or by event_id + vendor_id
        const { data: communications, error: commError } = await supabase
            .from('vendor_communications')
            .select('*')
            .or(`event_vendor_id.eq.${associationId},and(event_id.eq.${eventId},vendor_id.eq.${assocData.vendor_id})`)
            .order('created_at', { ascending: true })

        if (commError) {
            throw commError
        }

        return NextResponse.json({
            communications: communications || [],
            count: communications?.length || 0
        })

    } catch (error) {
        console.error('Error fetching vendor communications:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
