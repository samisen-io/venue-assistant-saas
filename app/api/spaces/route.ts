import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { spaceFormSchema } from '@/lib/utils/validation'
import { resolveVenueWithFallback } from '@/lib/venues/resolveVenue'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const resolved = await resolveVenueWithFallback(request, supabase, user.id)
        if (resolved.error) return NextResponse.json([])

        const { data: spaces, error } = await (supabase as any)
            .from('spaces')
            .select('*')
            .eq('venue_id', resolved.venue!.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(spaces || [])
    } catch (error) {
        console.error('Error fetching spaces:', error)
        return new NextResponse('Internal Error', { status: 500 })
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
        const body = spaceFormSchema.parse(json)

        const { data: space, error } = await (supabase as any)
            .from('spaces')
            .insert({
                ...body,
                venue_id: resolved.venue!.id
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(space)
    } catch (error: any) {
        console.error('Error creating space:', error)
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
        }
        return new NextResponse('Internal Error', { status: 500 })
    }
}
