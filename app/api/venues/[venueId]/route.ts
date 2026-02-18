import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { venueFormSchema } from '@/lib/utils/validation'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ venueId: string }> }
) {
    try {
        const supabase = await createClient()
        const { venueId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: venue, error } = await (supabase as any)
            .from('venues')
            .select('*')
            .eq('id', venueId)
            .single()

        if (error) throw error

        return NextResponse.json(venue)
    } catch (error) {
        console.error('Error fetching venue:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ venueId: string }> }
) {
    try {
        const supabase = await createClient()
        const { venueId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const json = await request.json()
        const body = venueFormSchema.parse(json)

        const { data: venue, error } = await (supabase as any)
            .from('venues')
            .update(body)
            .eq('id', venueId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(venue)
    } catch (error) {
        console.error('Error updating venue:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ venueId: string }> }
) {
    try {
        const supabase = await createClient()
        const { venueId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await request.json()

        // Handle setting a venue as default
        if (body.is_default === true) {
            // Clear is_default on all other venues for this user
            await (supabase as any)
                .from('venues')
                .update({ is_default: false })
                .eq('owner_id', user.id)
                .neq('id', venueId)

            const { data: venue, error } = await (supabase as any)
                .from('venues')
                .update({ is_default: true })
                .eq('id', venueId)
                .eq('owner_id', user.id)
                .select()
                .single()

            if (error) throw error
            return NextResponse.json(venue)
        }

        // Generic partial update (exclude protected fields)
        const { id: _id, owner_id: _owner, created_at: _created, ...safeFields } = body
        const { data: venue, error } = await (supabase as any)
            .from('venues')
            .update({ ...safeFields, updated_at: new Date().toISOString() })
            .eq('id', venueId)
            .eq('owner_id', user.id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(venue)
    } catch (error) {
        console.error('Error patching venue:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ venueId: string }> }
) {
    try {
        const supabase = await createClient()
        const { venueId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { error } = await (supabase as any)
            .from('venues')
            .delete()
            .eq('id', venueId)

        if (error) throw error

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting venue:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
