import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { getPlanByPriceId } from '@/lib/stripe/config'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const adminClient = createServiceRoleClient()

        // First check local database
        const { data: subscription, error } = await (adminClient as any)
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        // If we have a local subscription, return it
        if (subscription) {
            return NextResponse.json(subscription)
        }

        // No local subscription - try to find and sync from Stripe
        const syncedSubscription = await syncSubscriptionFromStripe(user.id, user.email!, adminClient)
        return NextResponse.json(syncedSubscription)
    } catch (error) {
        console.error('Error fetching subscription:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

async function syncSubscriptionFromStripe(userId: string, userEmail: string, adminClient: any) {
    try {
        // Search for customer by email in Stripe
        const customers = await stripe.customers.list({
            email: userEmail,
            limit: 1,
        })

        if (customers.data.length === 0) {
            return null
        }

        const customer = customers.data[0]

        // Get active subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
            limit: 1,
        })

        // Also check for trialing subscriptions
        if (subscriptions.data.length === 0) {
            const trialingSubscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                status: 'trialing',
                limit: 1,
            })
            if (trialingSubscriptions.data.length > 0) {
                subscriptions.data = trialingSubscriptions.data
            }
        }

        if (subscriptions.data.length === 0) {
            return null
        }

        const stripeSubscription = subscriptions.data[0]
        const priceId = stripeSubscription.items.data[0]?.price?.id
        const plan = priceId ? getPlanByPriceId(priceId) : null
        const planTier = plan?.tier || 'starter'

        // Sync to local database
        const subscriptionData = {
            user_id: userId,
            stripe_customer_id: customer.id,
            stripe_subscription_id: stripeSubscription.id,
            plan_tier: planTier,
            status: stripeSubscription.status === 'active' ? 'active' : stripeSubscription.status,
            current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
        }

        const { data: upsertedSubscription, error } = await adminClient
            .from('subscriptions')
            .upsert(subscriptionData, { onConflict: 'user_id' })
            .select()
            .single()

        if (error) {
            console.error('Error syncing subscription from Stripe:', error)
            return null
        }

        console.log(`Synced subscription from Stripe for user ${userId}`)
        return upsertedSubscription
    } catch (error) {
        console.error('Error syncing from Stripe:', error)
        return null
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { priceId } = await request.json()
        if (!priceId) {
            return new NextResponse('Price ID is required', { status: 400 })
        }

        const plan = getPlanByPriceId(priceId)
        if (!plan) {
            return new NextResponse('Invalid price ID', { status: 400 })
        }

        const adminClient = createServiceRoleClient()

        // Get or create Stripe customer
        const { data: subscription } = await (adminClient as any)
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single()

        let customerId = subscription?.stripe_customer_id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { user_id: user.id },
            })
            customerId = customer.id
        }

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
            metadata: {
                user_id: user.id,
                plan_tier: plan.tier,
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
