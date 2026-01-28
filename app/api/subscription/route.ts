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
        const { data: subscription, error } = await (adminClient as any)
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        return NextResponse.json(subscription || null)
    } catch (error) {
        console.error('Error fetching subscription:', error)
        return new NextResponse('Internal Error', { status: 500 })
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
