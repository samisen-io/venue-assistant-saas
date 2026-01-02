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

        const { vendor_id, event_service_id, quoted_cost } = await request.json()

        if (!vendor_id || !event_service_id) {
            return new NextResponse('Vendor ID and event service are required', { status: 400 })
        }

        const { data: association, error } = await supabase
            .from('event_vendors')
            .insert({
                event_id: eventId,
                vendor_id: vendor_id,
                event_service_id: event_service_id,
                quoted_cost: quoted_cost || 0,
                confirmed: false
            } as any)
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return new NextResponse('Vendor already added to this event', { status: 400 })
            }
            throw error
        }

        return NextResponse.json(association)
    } catch (error) {
        console.error('Error adding vendor to event:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

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

        const { data: vendors, error } = await supabase
            .from('event_vendors')
            .select(`
        *,
        vendors (*),
        event_services (*)
      `)
            .eq('event_id', eventId)

        if (error) throw error

        return NextResponse.json(vendors)
    } catch (error) {
        console.error('Error fetching event vendors:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
