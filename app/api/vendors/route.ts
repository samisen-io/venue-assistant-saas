import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { vendorFormSchema } from '@/lib/utils/validation'
import { Database } from '@/lib/types/database.types'
import { canCreateVendor } from '@/lib/subscription/limits'
import { trackVendorCreation } from '@/lib/subscription/usage'
import { resolveVenueWithFallback } from '@/lib/venues/resolveVenue'

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

        // Scope to the active venue from header, fallback to default venue
        const resolved = await resolveVenueWithFallback(request, supabase, user.id)
        const effectiveVenueId = venueId || (resolved.venue ? resolved.venue.id : null)
        if (effectiveVenueId) {
            query = query.eq('venue_id', effectiveVenueId)
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

        // Check subscription limits
        const vendorCheck = await canCreateVendor(user.id)
        if (!vendorCheck.allowed) {
            return NextResponse.json(
                { error: vendorCheck.reason, code: 'LIMIT_REACHED' },
                { status: 403 }
            )
        }

        const json = await request.json()
        const vendorData = json

        const resolved = await resolveVenueWithFallback(request, supabase, user.id)
        if (resolved.error) {
            return new NextResponse('No venue found. Please create a venue first.', { status: 400 })
        }

        const body = vendorFormSchema.parse(vendorData)

        const { event_service_ids, ...vendorFields } = body

        const insertData: VendorInsert = {
            ...vendorFields,
            venue_id: resolved.venue!.id,
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

        // Track usage
        await trackVendorCreation(user.id).catch(console.error)

        return NextResponse.json(vendor)
    } catch (error) {
        console.error('Error creating vendor:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
