import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { venueFormSchema } from '@/lib/utils/validation'
import { canCreateVenue } from '@/lib/subscription/limits'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Query via venue_team_members so invited members see their venues too
        const { data: venues, error } = await (supabase as any)
            .from('venues')
            .select('*, venue_team_members!inner(profile_id)')
            .eq('venue_team_members.profile_id', user.id)
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

        // Seed the creator as owner in venue_team_members.
        // Must use service role because the RLS policy requires membership to insert,
        // creating a chicken-and-egg problem for brand new venues.
        const serviceRole = createServiceRoleClient()
        await (serviceRole as any).from('venue_team_members').insert({
            venue_id: venue.id,
            profile_id: user.id,
            role: 'owner',
        })

        return NextResponse.json(venue)
    } catch (error) {
        console.error('Error creating venue:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
