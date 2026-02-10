import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { getPlanByPriceId } from '@/lib/stripe/config'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { sessionId } = await request.json()
        if (!sessionId) {
            return new NextResponse('Session ID is required', { status: 400 })
        }

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription'],
        })

        // Verify this session belongs to the current user
        if (session.metadata?.user_id !== user.id) {
            return new NextResponse('Session does not belong to this user', { status: 403 })
        }

        if (session.payment_status !== 'paid') {
            return new NextResponse('Payment not completed', { status: 400 })
        }

        const subscription = session.subscription as any
        if (!subscription) {
            return new NextResponse('No subscription found', { status: 400 })
        }

        // Get plan tier from price ID
        const priceId = subscription.items?.data?.[0]?.price?.id
        const plan = priceId ? getPlanByPriceId(priceId) : null
        const planTier = plan?.tier || session.metadata?.plan_tier || 'starter'

        const adminClient = createServiceRoleClient()

        // Upsert the subscription record
        const { error } = await (adminClient as any)
            .from('subscriptions')
            .upsert({
                user_id: user.id,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription.id,
                plan_tier: planTier,
                status: 'active',
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end || false,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })

        if (error) {
            console.error('Error upserting subscription:', error)
            return new NextResponse('Failed to save subscription', { status: 500 })
        }

        return NextResponse.json({ success: true, planTier })
    } catch (error) {
        console.error('Error syncing subscription:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
