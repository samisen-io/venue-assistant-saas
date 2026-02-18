import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { clientFormSchema } from '@/lib/utils/validation'
import { Database } from '@/lib/types/database.types'
import { resolveVenueWithFallback } from '@/lib/venues/resolveVenue'

type ClientInsert = Database['public']['Tables']['clients']['Insert']

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')

        const resolved = await resolveVenueWithFallback(request, supabase, user.id)
        if (resolved.error) return NextResponse.json([])

        let query = (supabase as any)
            .from('clients')
            .select('*')
            .eq('venue_id', resolved.venue!.id)
            .order('created_at', { ascending: false })

        if (search) {
            const escaped = search.replace(/%/g, '\\%').replace(/_/g, '\\_')
            query = query.or(
                `contact_name.ilike.%${escaped}%,company_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`
            )
        }

        const { data: clients, error } = await query

        if (error) throw error

        const clientIds = (clients || []).map((client: any) => client.id)
        let countsByClient = new Map<string, number>()

        if (clientIds.length > 0) {
            const { data: events, error: eventsError } = await (supabase as any)
                .from('events')
                .select('id, client_id')
                .in('client_id', clientIds)

            if (eventsError) throw eventsError

            countsByClient = (events || []).reduce((map: Map<string, number>, event: any) => {
                if (!event.client_id) return map
                const current = map.get(event.client_id) || 0
                map.set(event.client_id, current + 1)
                return map
            }, new Map<string, number>())
        }

        const clientsWithCounts = (clients || []).map((client: any) => ({
            ...client,
            event_count: countsByClient.get(client.id) || 0,
        }))

        return NextResponse.json(clientsWithCounts)
    } catch (error: any) {
        console.error('Error fetching clients:', error.message || error)
        return new NextResponse(JSON.stringify({ error: error.message || 'Internal Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const resolved = await resolveVenueWithFallback(request, supabase, user.id)
        if (resolved.error) {
            return new NextResponse('No venue found. Please create a venue first.', { status: 400 })
        }

        const json = await request.json()
        const { venue_id: _ignored, ...clientData } = json
        const body = clientFormSchema.parse(clientData)

        const insertData: ClientInsert = {
            venue_id: resolved.venue!.id,
            company_name: body.company_name?.trim() || null,
            contact_name: body.contact_name,
            email: body.email?.trim() || null,
            phone: body.phone?.trim() || null,
            notes: body.notes?.trim() || null,
            notify_on_booking_updates: body.notify_on_booking_updates ?? true,
        }

        const { data: client, error } = await (supabase as any)
            .from('clients')
            .insert(insertData)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(client)
    } catch (error: any) {
        console.error('Error creating client:', error.message || error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
