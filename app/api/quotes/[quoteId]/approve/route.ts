import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/quotes/[quoteId]/approve
 * Approve a quote and assign vendor to event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { quoteId: string } }
) {
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

    const { quoteId } = params

    // Get the quote with vendor and event details
    const { data: quote, error: quoteError } = await (supabase as any)
      .from('vendor_quotes')
      .select(`
        *,
        vendor:vendors(
          id,
          name,
          vendor_services (
            event_service_id
          )
        ),
        event:events(
          id,
          venue:venues(owner_id),
          event_service_requirements (event_service_id)
        )
      `)
      .eq('id', quoteId)
      .single()

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Verify ownership
    if (quote.event?.venue?.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if quote is already approved or rejected
    if (quote.status !== 'pending') {
      return NextResponse.json(
        { error: `Quote is already ${quote.status}` },
        { status: 400 }
      )
    }

    // Update quote status to approved
    const { error: updateError } = await (supabase as any)
      .from('vendor_quotes')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId)

    if (updateError) {
      throw updateError
    }

    // Check if vendor is already assigned to this event
    const { data: existingAssignment } = await (supabase as any)
      .from('event_vendors')
      .select('id')
      .eq('event_id', quote.event_id)
      .eq('vendor_id', quote.vendor_id)
      .eq('event_service_id', eventServiceId)
      .single()

    const requiredServices = quote.event?.event_service_requirements || []
    const vendorServices = quote.vendor?.vendor_services || []
    const overlappingService = requiredServices.find((req: any) =>
      vendorServices.some((service: any) => service.event_service_id === req.event_service_id)
    )
    const eventServiceId = overlappingService?.event_service_id || vendorServices[0]?.event_service_id

    if (!eventServiceId) {
      return NextResponse.json({ error: 'No matching service found for this vendor' }, { status: 400 })
    }

    let eventVendorId = existingAssignment?.id

    if (!existingAssignment) {
      // Assign vendor to event
      const { data: newAssignment, error: assignError } = await (supabase as any)
        .from('event_vendors')
        .insert({
          event_id: quote.event_id,
          vendor_id: quote.vendor_id,
          event_service_id: eventServiceId,
          assignment_type: 'primary',
          quoted_cost: quote.total_cost,
          confirmed: true,
          confirmed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (assignError) {
        console.error('Error assigning vendor:', assignError)
      } else {
        eventVendorId = newAssignment?.id
      }
    } else {
      // Update existing assignment with quote info
      await (supabase as any)
        .from('event_vendors')
        .update({
          quoted_cost: quote.total_cost,
          confirmed: true,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', existingAssignment.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Quote approved and vendor assigned',
      eventVendorId,
    })
  } catch (error: any) {
    console.error('Error approving quote:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
