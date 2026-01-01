import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { eventFormSchema } from '@/lib/utils/validation'

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

        const { data: event, error } = await supabase
            .from('events')
            .select(`
        *,
        spaces (*),
        venues (*),
        event_vendors (*)
      `)
            .eq('id', eventId)
            .single()

        if (error) throw error

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error fetching event:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PUT(
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

        const json = await request.json()
        // Separate update logic if needed, but for now reuse schema
        const body = eventFormSchema.partial().parse(json)

        const { data: event, error } = await supabase
            .from('events')
            .update(body)
            .eq('id', eventId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error updating event:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(
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

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId)

        if (error) throw error

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting event:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
