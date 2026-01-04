import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { vendorFormSchema } from '@/lib/utils/validation'
import { Database } from '@/lib/types/database.types'

type VendorInsert = Database['public']['Tables']['vendors']['Insert']

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const venueId = searchParams.get('venueId')
        const serviceId = searchParams.get('serviceId')

        let query = (supabase as any)
            .from('vendors')
            .select(`
                *,
                venues (name),
                vendor_services (
                    event_service_id,
                    event_services (id, name, slug)
                )
            `)
            .eq('is_active', true)
            .order('name', { ascending: true })

        if (venueId) {
            query = query.eq('venue_id', venueId)
        }

        if (serviceId) {
            query = query.eq('vendor_services.event_service_id', serviceId)
        }

        const { data: vendors, error } = await query

        if (error) throw error

        return NextResponse.json(vendors)
    } catch (error: any) {
        console.error('Error fetching vendors:', error.message || error)
        return new NextResponse(JSON.stringify({ error: error.message || 'Internal Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
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

        const json = await request.json()
        const vendorData = json

        // Get user's venue (single venue per user now)
        const { data: venue, error: venueError } = await (supabase as any)
            .from('venues')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (venueError || !venue) {
            return new NextResponse('No venue found. Please create a venue first.', { status: 400 })
        }

        const body = vendorFormSchema.parse(vendorData)

        const { event_service_ids, ...vendorFields } = body

        const insertData: VendorInsert = {
            ...vendorFields,
            venue_id: venue.id, // Use user's venue
            is_active: true,
            total_events: 0,
            avg_quality_rating: 0,
            reliability_score: 100
        }

        const { data: vendor, error } = await (supabase as any)
            .from('vendors')
            .insert(insertData)
            .select()
            .single()

        if (error) throw error

        const vendorServices = event_service_ids.map((eventServiceId: string) => ({
            vendor_id: vendor.id,
            event_service_id: eventServiceId
        }))

        const { error: vendorServicesError } = await (supabase as any)
            .from('vendor_services')
            .insert(vendorServices)

        if (vendorServicesError) throw vendorServicesError

        return NextResponse.json(vendor)
    } catch (error) {
        console.error('Error creating vendor:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
