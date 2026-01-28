import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { clientFormSchema } from '@/lib/utils/validation'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ clientId: string }> }
) {
    try {
        const supabase = await createClient()
        const { clientId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: client, error } = await (supabase as any)
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single()

        if (error) throw error

        const { data: events, error: eventsError } = await (supabase as any)
            .from('events')
            .select('id, event_name, event_date, event_time, event_end_time, status, space_id')
            .eq('client_id', clientId)
            .order('event_date', { ascending: false })

        if (eventsError) throw eventsError

        return NextResponse.json({ ...client, events: events || [] })
    } catch (error) {
        console.error('Error fetching client:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ clientId: string }> }
) {
    try {
        const supabase = await createClient()
        const { clientId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const json = await request.json()
        const { venue_id: _venueId, ...clientData } = json
        const body = clientFormSchema.partial().parse(clientData)

        const updateData: any = {
            ...body,
        }

        if ('company_name' in updateData) updateData.company_name = updateData.company_name?.trim() || null
        if ('email' in updateData) updateData.email = updateData.email?.trim() || null
        if ('phone' in updateData) updateData.phone = updateData.phone?.trim() || null
        if ('notes' in updateData) updateData.notes = updateData.notes?.trim() || null

        const { data: client, error } = await (supabase as any)
            .from('clients')
            .update(updateData)
            .eq('id', clientId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(client)
    } catch (error) {
        console.error('Error updating client:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ clientId: string }> }
) {
    try {
        const supabase = await createClient()
        const { clientId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { error } = await (supabase as any)
            .from('clients')
            .delete()
            .eq('id', clientId)

        if (error) throw error

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting client:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
