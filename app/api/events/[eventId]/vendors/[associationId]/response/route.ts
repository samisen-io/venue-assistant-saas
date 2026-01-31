import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { determineStatusFromResponse } from '@/lib/algorithms/budgetComparison'
import type { VendorOutreachStatus } from '@/lib/types/vendor-outreach.types'

/**
 * POST /api/events/[eventId]/vendors/[associationId]/response
 *
 * Record a vendor's response (available or not available).
 * This is used for manual response recording when not using the AI agent.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ eventId: string; associationId: string }> }
) {
    try {
        const supabase = await createClient()
        const { eventId, associationId } = await params

        // Verify user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Parse request body
        const body = await request.json()
        const { responseType, quotedAmount, notes } = body

        if (!responseType || !['available', 'not_available'].includes(responseType)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid responseType. Must be "available" or "not_available".'
            }, { status: 400 })
        }

        // Get the event-vendor association with budget info
        const { data: association, error: assocError } = await supabase
            .from('event_vendors')
            .select(`
                *,
                events (
                    venue_id,
                    venues (owner_id)
                )
            `)
            .eq('id', associationId)
            .single()

        if (assocError || !association) {
            return new NextResponse('Event-vendor association not found', { status: 404 })
        }

        // Verify the event belongs to the user's venue
        const venue = (association as any).events?.venues
        if (!venue || venue.owner_id !== user.id) {
            return new NextResponse('Unauthorized', { status: 403 })
        }

        const assocData = association as any

        // Get budget for this service
        const { data: budgetReq } = await supabase
            .from('event_service_requirements')
            .select('budget_amount')
            .eq('event_id', eventId)
            .eq('event_service_id', assocData.event_service_id)
            .single()

        const budgetAmount = (budgetReq as any)?.budget_amount

        // Determine the appropriate status
        let newStatus: VendorOutreachStatus

        if (responseType === 'not_available') {
            newStatus = 'not_available'
        } else {
            // Vendor is available - check if quote is over budget
            newStatus = determineStatusFromResponse(
                true, // isAvailable
                quotedAmount ?? assocData.quoted_cost,
                budgetAmount
            )
        }

        const now = new Date().toISOString()

        // Update the event_vendors record
        const updateData: any = {
            outreach_status: newStatus,
            status_updated_at: now,
            vendor_response_at: now,
            status_notes: notes || null
        }

        // Update quoted cost if provided
        if (quotedAmount !== undefined && quotedAmount !== null) {
            updateData.quoted_cost = quotedAmount
        }

        const { data: updatedAssociation, error: updateError } = await (supabase as any)
            .from('event_vendors')
            .update(updateData)
            .eq('id', associationId)
            .select()
            .single()

        if (updateError) {
            throw updateError
        }

        return NextResponse.json({
            success: true,
            message: `Vendor marked as ${newStatus.replace('_', ' ')}`,
            newStatus,
            eventVendor: updatedAssociation,
            budgetComparison: {
                quotedAmount: quotedAmount ?? assocData.quoted_cost,
                budgetAmount,
                isOverBudget: newStatus === 'needs_attention'
            }
        })

    } catch (error) {
        console.error('Error recording vendor response:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
