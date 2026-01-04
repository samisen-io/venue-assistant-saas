import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { spaceFormSchema } from '@/lib/utils/validation'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ spaceId: string }> }
) {
    try {
        const { spaceId } = await params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // RLS will ensure user can only access their own spaces
        const { data: space, error } = await (supabase as any)
            .from('spaces')
            .select('*')
            .eq('id', spaceId)
            .single()

        if (error) throw error

        return NextResponse.json(space)
    } catch (error) {
        console.error('Error fetching space:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ spaceId: string }> }
) {
    try {
        const { spaceId } = await params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const json = await request.json()
        const body = spaceFormSchema.parse(json)

        // RLS will ensure user can only update their own spaces
        const { data: space, error } = await (supabase as any)
            .from('spaces')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', spaceId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(space)
    } catch (error: any) {
        console.error('Error updating space:', error)
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
        }
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ spaceId: string }> }
) {
    try {
        const { spaceId } = await params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // RLS will ensure user can only delete their own spaces
        const { error } = await (supabase as any)
            .from('spaces')
            .delete()
            .eq('id', spaceId)

        if (error) throw error

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting space:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
