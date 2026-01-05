import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/quotes?eventId=xxx
 * Get all quotes for an event
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
    const status = searchParams.get('status')
    const serviceId = searchParams.get('serviceId')

    // Build query
    let query = (supabase as any).from('vendor_quotes').select(`
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
      event:events(id, event_name, event_date, budget_total, venue:venues(owner_id)),
      communication:vendor_communications(id, subject, received_at)
    `)

    // Filter by event
    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false })

    const { data: quotes, error } = await query

    if (error) {
      throw error
    }

    // Filter by ownership and optionally by service
    let ownedQuotes = quotes.filter(
      (quote: any) => quote.event?.venue?.owner_id === user.id
    )

    if (serviceId) {
      ownedQuotes = ownedQuotes.filter(
        (quote: any) => quote.vendor?.vendor_services?.some(
          (service: any) => service.event_service_id === serviceId
        )
      )
    }

    return NextResponse.json(ownedQuotes)
  } catch (error: any) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
