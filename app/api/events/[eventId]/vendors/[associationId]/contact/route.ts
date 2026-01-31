import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import {
    generateOutreachSubject,
    generateOutreachHTML,
    generateOutreachPlainText,
    VendorOutreachTemplateData
} from '@/lib/email/templates/vendorOutreach'

/**
 * POST /api/events/[eventId]/vendors/[associationId]/contact
 *
 * Send initial contact email to a vendor and update their outreach status.
 * This creates a vendor_communications record and updates event_vendors status.
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

        // Parse optional custom message from request body
        let customMessage: string | undefined
        try {
            const body = await request.json()
            customMessage = body.customMessage
        } catch {
            // No body or invalid JSON - that's fine
        }

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

        // Verify the event belongs to the user's venue
        const event = (association as any).events
        const venue = event?.venues

        if (!venue || venue.owner_id !== user.id) {
            return new NextResponse('Unauthorized', { status: 403 })
        }

        const vendor = (association as any).vendors

        // Check if vendor has an email
        if (!vendor?.contact_email) {
            return NextResponse.json({
                success: false,
                error: 'Vendor does not have an email address. Please add an email to the vendor profile first.'
            }, { status: 400 })
        }

        // Check if already contacted (prevent duplicate emails)
        if ((association as any).outreach_status === 'contacted') {
            return NextResponse.json({
                success: false,
                error: 'Vendor has already been contacted. Use the follow-up action instead.'
            }, { status: 400 })
        }

        // Get user's profile for contact info
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', user.id)
            .single()

        const profileData = profile as any

        // Prepare email template data
        const templateData: VendorOutreachTemplateData = {
            event: event,
            vendor: vendor,
            venueName: venue.name,
            venueContact: {
                name: profileData?.full_name || venue.contact_name || 'Venue Manager',
                email: profileData?.email || user.email || '',
                phone: profileData?.phone || venue.phone
            },
            customMessage
        }

        // Generate email content
        const subject = generateOutreachSubject(templateData)
        const htmlBody = generateOutreachHTML(templateData)
        const textBody = generateOutreachPlainText(templateData)

        // Send the email
        const emailResult = await sendEmail({
            to: vendor.contact_email,
            from: profileData?.email || user.email || '',
            subject,
            body: htmlBody,
            metadata: {
                eventId: eventId,
                vendorId: vendor.id,
                purpose: 'outreach'
            }
        })

        if (!emailResult.success) {
            return NextResponse.json({
                success: false,
                error: emailResult.error || 'Failed to send email'
            }, { status: 500 })
        }

        const now = new Date().toISOString()

        // Create vendor_communications record
        const { data: communication, error: commError } = await supabase
            .from('vendor_communications')
            .insert({
                event_id: eventId,
                vendor_id: vendor.id,
                event_vendor_id: associationId,
                direction: 'outbound',
                subject: subject,
                body: textBody,
                from_email: profileData?.email || user.email,
                to_email: vendor.contact_email,
                email_id: emailResult.messageId,
                status: 'sent',
                sent_at: now,
                processed: false,
                requires_followup: true
            } as any)
            .select()
            .single()

        if (commError) {
            console.error('Error creating communication record:', commError)
            // Don't fail the request - email was sent successfully
        }

        // Update event_vendors status to 'contacted'
        const { data: updatedAssociation, error: updateError } = await (supabase as any)
            .from('event_vendors')
            .update({
                outreach_status: 'contacted',
                status_updated_at: now,
                contacted_at: now,
                status_notes: customMessage ? `Custom message included: ${customMessage.substring(0, 100)}...` : null
            })
            .eq('id', associationId)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating association status:', updateError)
            // Don't fail - email was sent
        }

        return NextResponse.json({
            success: true,
            message: `Contact email sent to ${vendor.name}`,
            communicationId: (communication as any)?.id,
            newStatus: 'contacted',
            eventVendor: updatedAssociation
        })

    } catch (error) {
        console.error('Error contacting vendor:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
