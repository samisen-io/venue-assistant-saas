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

        const { data: vendor, error } = await supabase
            .from('vendors')
            .select(`
        *,
        venues (name)
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

        const { data: vendor, error } = await supabase
            .from('vendors')
            .update(body as any)
            .eq('id', vendorId)
            .select()
            .single()

        if (error) throw error

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
        const { error } = await supabase
            .from('vendors')
            .update({ is_active: false } as any)
            .eq('id', vendorId)

        if (error) throw error

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting vendor:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
