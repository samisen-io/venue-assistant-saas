import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Fetch user profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
        
        // Fetch venues
        const { data: venues } = await supabase.from('venues').select('*').eq('owner_id', userId)
        
        const venueIds = venues?.map((v: any) => v.id) || []
        
        const { data: events } = venueIds.length > 0 ? await supabase.from('events').select('*').in('venue_id', venueIds) : { data: [] }
        const { data: leads } = venueIds.length > 0 ? await supabase.from('leads').select('*').in('venue_id', venueIds) : { data: [] }
        const { data: spaces } = venueIds.length > 0 ? await supabase.from('spaces').select('*').in('venue_id', venueIds) : { data: [] }

        const exportData = {
            exportDate: new Date().toISOString(),
            profile,
            venues,
            spaces,
            events,
            leads
        }

        // Return as a downloadable JSON file
        const jsonString = JSON.stringify(exportData, null, 2)
        const bytes = new TextEncoder().encode(jsonString)

        return new Response(bytes, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="venue-assistant-export-${new Date().toISOString().slice(0, 10)}.json"`
            }
        })
    } catch (error) {
        console.error('Data export error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
