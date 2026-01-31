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
                confirmed: false,
                outreach_status: 'pending',
                status_updated_at: new Date().toISOString()
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

        // Fetch event vendors with related data
        const { data: vendors, error } = await supabase
            .from('event_vendors')
            .select(`
                *,
                vendors (*),
                event_services (*)
            `)
            .eq('event_id', eventId)

        if (error) throw error

        // Fetch budget allocations for the event
        const { data: budgets } = await supabase
            .from('event_service_requirements')
            .select('event_service_id, budget_amount')
            .eq('event_id', eventId)

        // Merge budget info into vendors
        const vendorsWithBudget = (vendors as any[])?.map((v: any) => {
            const budget = (budgets as any[])?.find((b: any) => b.event_service_id === v.event_service_id)
            return {
                ...v,
                budget_allocation: budget ? { budget_amount: budget.budget_amount } : null
            }
        })

        // Count communications for each event_vendor
        const { data: commCounts } = await supabase
            .from('vendor_communications')
            .select('event_vendor_id')
            .eq('event_id', eventId)

        const vendorsWithComms = vendorsWithBudget?.map((v: any) => {
            const count = (commCounts as any[])?.filter((c: any) => c.event_vendor_id === v.id).length || 0
            return {
                ...v,
                communication_count: count
            }
        })

        return NextResponse.json(vendorsWithComms)
    } catch (error) {
        console.error('Error fetching event vendors:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
