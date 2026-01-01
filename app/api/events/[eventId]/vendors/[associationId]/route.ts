import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ eventId: string; associationId: string }> }
) {
    try {
        const supabase = await createClient()
        const { associationId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await request.json()

        const { data: association, error } = await supabase
            .from('event_vendors')
            .update(body as any)
            .eq('id', associationId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(association)
    } catch (error) {
        console.error('Error updating association:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ eventId: string; associationId: string }> }
) {
    try {
        const supabase = await createClient()
        const { associationId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { error } = await supabase
            .from('event_vendors')
            .delete()
            .eq('id', associationId)

        if (error) throw error

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting association:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
