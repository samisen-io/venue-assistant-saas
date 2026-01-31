import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import {
    generateConfirmationSubject,
    generateConfirmationHTML,
    generateConfirmationPlainText
} from '@/lib/email/templates/vendorConfirmation'
import { canTransitionTo } from '@/lib/utils/vendorOutreachStatus'
import type { VendorOutreachStatus } from '@/lib/types/vendor-outreach.types'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ eventId: string; associationId: string }> }
) {
    try {
        const supabase = await createClient()
        const { eventId, associationId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await request.json()

        // Handle special actions: confirm or reject
        if (body.action === 'confirm' || body.action === 'reject') {
            return handleVendorDecision(supabase, user, eventId, associationId, body)
        }

        // Regular update
        const { data: association, error } = await (supabase as any)
            .from('event_vendors')
            .update(body)
            .eq('id', associationId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(association)
    } catch (error) {
        console.error('Error updating association:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

/**
 * Handle confirm or reject action for a vendor
 */
async function handleVendorDecision(
    supabase: any,
    user: any,
    eventId: string,
    associationId: string,
    body: { action: 'confirm' | 'reject'; reason?: string; sendNotification?: boolean }
) {
    const { action, reason, sendNotification = true } = body

    // Get the event-vendor association with related data
    const { data: association, error: assocError } = await supabase
        .from('event_vendors')
        .select(`
            *,
            vendors (*),
            event_services (*),
            events (
                *,
                venues (*)
            )
        `)
        .eq('id', associationId)
        .single()

    if (assocError || !association) {
        return new NextResponse('Event-vendor association not found', { status: 404 })
    }

    // Verify ownership
    const event = association.events
    const venue = event?.venues
    if (!venue || venue.owner_id !== user.id) {
        return new NextResponse('Unauthorized', { status: 403 })
    }

    const currentStatus = association.outreach_status as VendorOutreachStatus | null
    const newStatus: VendorOutreachStatus = action === 'confirm' ? 'confirmed' : 'rejected'

    // Validate status transition
    if (currentStatus && !canTransitionTo(currentStatus, newStatus)) {
        return NextResponse.json({
            success: false,
            error: `Cannot ${action} vendor from status "${currentStatus}"`
        }, { status: 400 })
    }

    const now = new Date().toISOString()
    const vendor = association.vendors

    // Prepare update data
    const updateData: any = {
        outreach_status: newStatus,
        status_updated_at: now,
    }

    if (action === 'confirm') {
        updateData.confirmed = true
        updateData.confirmed_at = now
    } else {
        updateData.rejection_reason = reason || null
    }

    // Send confirmation email if requested and vendor has email
    if (action === 'confirm' && sendNotification && vendor?.email) {
        // Get user's profile for contact info
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', user.id)
            .single()

        const templateData = {
            event: event,
            vendor: vendor,
            venueName: venue.name,
            venueContact: {
                name: profile?.full_name || venue.contact_name || 'Venue Manager',
                email: profile?.email || user.email || '',
                phone: profile?.phone || venue.phone
            },
            quotedCost: association.quoted_cost,
            serviceName: association.event_services?.name
        }

        const subject = generateConfirmationSubject(templateData)
        const htmlBody = generateConfirmationHTML(templateData)
        const textBody = generateConfirmationPlainText(templateData)

        const emailResult = await sendEmail({
            to: vendor.email,
            from: profile?.email || user.email || '',
            subject,
            body: htmlBody,
            metadata: {
                eventId: eventId,
                vendorId: vendor.id,
                purpose: 'confirmation'
            }
        })

        // Log the communication
        if (emailResult.success) {
            await supabase
                .from('vendor_communications')
                .insert({
                    event_id: eventId,
                    vendor_id: vendor.id,
                    event_vendor_id: associationId,
                    direction: 'outbound',
                    subject: subject,
                    body: textBody,
                    from_email: profile?.email || user.email,
                    to_email: vendor.email,
                    email_id: emailResult.messageId,
                    status: 'sent',
                    sent_at: now,
                    processed: true,
                    requires_followup: false
                })
        }
    }

    // Update the association
    const { data: updatedAssociation, error: updateError } = await supabase
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
        message: action === 'confirm'
            ? `${vendor?.name || 'Vendor'} has been confirmed for this event`
            : `${vendor?.name || 'Vendor'} has been rejected`,
        newStatus,
        eventVendor: updatedAssociation,
        emailSent: action === 'confirm' && sendNotification && vendor?.email
    })
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ eventId: string; associationId: string }> }
) {
    try {
        const supabase = await createClient()
        const { associationId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { error } = await (supabase as any)
            .from('event_vendors')
            .delete()
            .eq('id', associationId)

        if (error) throw error

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting association:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
