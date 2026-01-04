import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { data: venue, error: venueError } = await (supabase as any)
      .from('venues')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (venueError || !venue) {
      return NextResponse.json([])
    }

    const { data: services, error } = await (supabase as any)
      .from('event_services')
      .select('*')
      .eq('venue_id', venue.id)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching event services:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
