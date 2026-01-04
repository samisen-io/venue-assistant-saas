import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/quotes/[quoteId]/reject
 * Reject a quote
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
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

    const { quoteId } = await params

    // Parse request body for rejection reason
    const body = await request.json()
    const { reason } = body

    // Get the quote
    const { data: quote, error: quoteError } = await (supabase as any)
      .from('vendor_quotes')
      .select('*, event:events(venue:venues(owner_id))')
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

    // Update quote status to rejected
    const { error: updateError } = await (supabase as any)
      .from('vendor_quotes')
      .update({
        status: 'rejected',
        rejected_reason: reason || 'No reason provided',
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Quote rejected',
    })
  } catch (error: any) {
    console.error('Error rejecting quote:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
