import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/communications?eventId=xxx
 * Get all communications for an event
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const vendorId = searchParams.get('vendorId')
    const direction = searchParams.get('direction')

    // Build query
    let query = (supabase as any).from('vendor_communications').select(`
      *,
      vendor:vendors(id, name, contact_email, category),
      event:events(id, event_name, event_date, venue:venues(owner_id))
    `)

    // Filter by event
    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    // Filter by vendor
    if (vendorId) {
      query = query.eq('vendor_id', vendorId)
    }

    // Filter by direction
    if (direction && (direction === 'inbound' || direction === 'outbound')) {
      query = query.eq('direction', direction)
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false })

    const { data: communications, error } = await query

    if (error) {
      throw error
    }

    // Filter by ownership
    const ownedCommunications = communications.filter(
      (comm: any) => comm.event?.venue?.owner_id === user.id
    )

    return NextResponse.json(ownedCommunications)
  } catch (error: any) {
    console.error('Error fetching communications:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
