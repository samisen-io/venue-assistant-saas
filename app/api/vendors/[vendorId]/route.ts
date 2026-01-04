import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { vendorFormSchema } from '@/lib/utils/validation'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ vendorId: string }> }
) {
    try {
        const supabase = await createClient()
        const { vendorId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: vendor, error } = await (supabase as any)
            .from('vendors')
            .select(`
        *,
        venues (name),
        vendor_services (
            event_service_id,
            event_services (id, name, slug)
        )
      `)
            .eq('id', vendorId)
            .single()

        if (error) throw error

        return NextResponse.json(vendor)
    } catch (error) {
        console.error('Error fetching vendor:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ vendorId: string }> }
) {
    try {
        const supabase = await createClient()
        const { vendorId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const json = await request.json()
        const body = vendorFormSchema.partial().parse(json)
        const { event_service_ids, ...vendorFields } = body

        const { data: vendor, error } = await (supabase as any)
            .from('vendors')
            .update(vendorFields)
            .eq('id', vendorId)
            .select()
            .single()

        if (error) throw error

        if (event_service_ids) {
            await (supabase as any)
                .from('vendor_services')
                .delete()
                .eq('vendor_id', vendorId)

            if (event_service_ids.length > 0) {
                const vendorServices = event_service_ids.map((eventServiceId: string) => ({
                    vendor_id: vendorId,
                    event_service_id: eventServiceId
                }))

                const { error: vendorServicesError } = await (supabase as any)
                    .from('vendor_services')
                    .insert(vendorServices)

                if (vendorServicesError) throw vendorServicesError
            }
        }

        return NextResponse.json(vendor)
    } catch (error) {
        console.error('Error updating vendor:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ vendorId: string }> }
) {
    try {
        const supabase = await createClient()
        const { vendorId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Soft delete by setting is_active to false
        const { error } = await (supabase as any)
            .from('vendors')
            .update({ is_active: false })
            .eq('id', vendorId)

        if (error) throw error

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting vendor:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
