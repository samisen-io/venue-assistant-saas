import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/communications/thread?eventId=xxx&vendorId=xxx
 * Get communication thread for a specific event and vendor
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

    if (!eventId || !vendorId) {
      return NextResponse.json(
        { error: 'Missing eventId or vendorId' },
        { status: 400 }
      )
    }

    // Get all communications for this event-vendor pair
    const { data: communications, error } = await (supabase as any)
      .from('vendor_communications')
      .select(`
        *,
        vendor:vendors(
          id,
          name,
          contact_email,
          reliability_score,
          vendor_services (
            event_service_id,
            event_services (id, name, slug)
          )
        ),
        event:events(id, event_name, event_date, venue:venues(owner_id))
      `)
      .eq('event_id', eventId)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    // Verify ownership
    if (communications.length > 0) {
      const ownershipCheck = communications[0]?.event?.venue?.owner_id
      if (ownershipCheck !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Get associated quotes for this vendor-event pair
    const { data: quotes } = await (supabase as any)
      .from('vendor_quotes')
      .select('*')
      .eq('event_id', eventId)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      communications,
      quotes: quotes || [],
      threadId: communications[0]?.thread_id || null,
    })
  } catch (error: any) {
    console.error('Error fetching communication thread:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
