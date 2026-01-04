import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { venueFormSchema } from '@/lib/utils/validation'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // RLS will handle filtering for current user
        const { data: venues, error } = await (supabase as any)
            .from('venues')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(venues)
    } catch (error) {
        console.error('Error fetching venues:', error)
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

        const json = await request.json()
        const body = venueFormSchema.parse(json)

        const { data: venue, error } = await (supabase as any)
            .from('venues')
            .insert({
                ...body,
                owner_id: user.id
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(venue)
    } catch (error) {
        console.error('Error creating venue:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
