import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { spaceFormSchema } from '@/lib/utils/validation'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Get user's venue first
        const { data: venue } = await (supabase as any)
            .from('venues')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (!venue) {
            return NextResponse.json([]) // No venue yet, return empty array
        }

        // RLS will handle filtering, but we query by venue_id for clarity
        const { data: spaces, error } = await (supabase as any)
            .from('spaces')
            .select('*')
            .eq('venue_id', venue.id)
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

        // Get user's venue
        const { data: venue, error: venueError } = await (supabase as any)
            .from('venues')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (venueError || !venue) {
            return new NextResponse('No venue found. Please create a venue first.', { status: 400 })
        }

        const json = await request.json()
        const body = spaceFormSchema.parse(json)

        const { data: space, error } = await (supabase as any)
            .from('spaces')
            .insert({
                ...body,
                venue_id: venue.id
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
