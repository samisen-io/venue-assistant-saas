import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { venueFormSchema } from '@/lib/utils/validation'
import { canCreateVenue } from '@/lib/subscription/limits'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: venues, error } = await (supabase as any)
            .from('venues')
            .select('*')
            .eq('owner_id', user.id)
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

        // Check subscription limits
        const venueCheck = await canCreateVenue(user.id)
        if (!venueCheck.allowed) {
            return NextResponse.json(
                { error: venueCheck.reason, code: 'LIMIT_REACHED' },
                { status: 403 }
            )
        }

        const json = await request.json()
        const body = venueFormSchema.parse(json)

        const { data: venue, error } = await (supabase as any)
            .from('venues')
            .insert({
                ...body,
                owner_id: user.id,
                is_default: false,
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
