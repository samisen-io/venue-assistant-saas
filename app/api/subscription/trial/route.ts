import { NextResponse } from 'next/server'
import { createTrialSubscription } from '@/lib/subscription/trial'
import { sendEmail } from '@/lib/email/resend'
import { generateWelcomeSubject, generateWelcomeHTML } from '@/lib/email/templates/welcome'

export async function POST(request: Request) {
    try {
        const { userId, email, fullName } = await request.json()

        if (!userId || !email) {
            return new NextResponse('userId and email are required', { status: 400 })
        }

        const subscription = await createTrialSubscription(userId, email, fullName)

        // Send welcome email — fire-and-forget, don't block the response
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const founderName = process.env.FOUNDER_NAME || 'The VenueManager Team'
        sendEmail({
            to: email,
            from: process.env.RESEND_FROM_EMAIL || 'noreply@venuemanager.com',
            subject: generateWelcomeSubject(),
            body: generateWelcomeHTML({
                fullName: fullName || '',
                pageEditorUrl: `${baseUrl}/dashboard/venues`,
                founderName,
            }),
        }).catch(err => console.error('Failed to send welcome email:', err))

        return NextResponse.json(subscription)
    } catch (error) {
        console.error('Error creating trial subscription:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
