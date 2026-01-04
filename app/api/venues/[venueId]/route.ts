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
