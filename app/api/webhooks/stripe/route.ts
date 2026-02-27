import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getPlanByPriceId } from '@/lib/stripe/config'
import Stripe from 'stripe'
import { sendEmail } from '@/lib/email/resend'
import { generatePaymentFailedSubject, generatePaymentFailedHTML } from '@/lib/email/templates/paymentFailed'

export async function POST(request: Request) {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
        return new NextResponse('Missing stripe-signature header', { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.user_id
                const planTier = session.metadata?.plan_tier
                const subscriptionId = session.subscription as string
                const customerId = session.customer as string

                if (!userId || !planTier) break

                // Fetch the Stripe subscription for period info
                const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as any

                await (supabase as any)
                    .from('subscriptions')
                    .upsert({
                        user_id: userId,
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        plan_tier: planTier,
                        status: 'active',
                        current_period_start: new Date((stripeSubscription.current_period_start || 0) * 1000).toISOString(),
                        current_period_end: new Date((stripeSubscription.current_period_end || 0) * 1000).toISOString(),
                        cancel_at_period_end: false,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'user_id' })

                console.log(`Subscription activated for user ${userId}: ${planTier}`)
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any
                const customerId = subscription.customer as string

                // Find user by Stripe customer ID
                const { data: existingSub } = await (supabase as any)
                    .from('subscriptions')
                    .select('user_id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (!existingSub) break

                // Determine plan tier from price ID
                const priceId = subscription.items?.data?.[0]?.price?.id
                const plan = priceId ? getPlanByPriceId(priceId) : null

                const updateData: any = {
                    status: subscription.status === 'active' ? 'active' :
                        subscription.status === 'past_due' ? 'past_due' :
                            subscription.status === 'canceled' ? 'canceled' :
                                subscription.status,
                    current_period_start: new Date((subscription.current_period_start || 0) * 1000).toISOString(),
                    current_period_end: new Date((subscription.current_period_end || 0) * 1000).toISOString(),
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    updated_at: new Date().toISOString(),
                }
                if (plan?.tier) updateData.plan_tier = plan.tier

                await (supabase as any)
                    .from('subscriptions')
                    .update(updateData)
                    .eq('stripe_customer_id', customerId)

                console.log(`Subscription updated for customer ${customerId}`)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any
                const customerId = subscription.customer as string

                await (supabase as any)
                    .from('subscriptions')
                    .update({
                        status: 'canceled',
                        cancel_at_period_end: false,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_customer_id', customerId)

                console.log(`Subscription canceled for customer ${customerId}`)
                break
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any
                const customerId = invoice.customer as string

                // Update period dates on successful payment
                if (invoice.subscription) {
                    const stripeSubscription = await stripe.subscriptions.retrieve(
                        invoice.subscription as string
                    ) as any

                    await (supabase as any)
                        .from('subscriptions')
                        .update({
                            status: 'active',
                            current_period_start: new Date((stripeSubscription.current_period_start || 0) * 1000).toISOString(),
                            current_period_end: new Date((stripeSubscription.current_period_end || 0) * 1000).toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                        .eq('stripe_customer_id', customerId)
                }

                console.log(`Payment succeeded for customer ${customerId}`)
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any
                const customerId = invoice.customer as string

                await (supabase as any)
                    .from('subscriptions')
                    .update({
                        status: 'past_due',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_customer_id', customerId)

                // Notify user of payment failure — fire-and-forget
                ;(async () => {
                    try {
                        const { data: sub } = await (supabase as any)
                            .from('subscriptions')
                            .select('user_id')
                            .eq('stripe_customer_id', customerId)
                            .single()

                        if (sub?.user_id) {
                            const { data: profile } = await (supabase as any)
                                .from('profiles')
                                .select('email, full_name')
                                .eq('id', sub.user_id)
                                .single()

                            if (profile?.email) {
                                const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
                                await sendEmail({
                                    to: profile.email,
                                    from: process.env.RESEND_FROM_EMAIL || 'noreply@venuemanager.com',
                                    subject: generatePaymentFailedSubject(),
                                    body: generatePaymentFailedHTML({
                                        fullName: profile.full_name || '',
                                        billingUrl: `${baseUrl}/dashboard/settings/billing`,
                                    }),
                                })
                            }
                        }
                    } catch (err) {
                        console.error('Failed to send payment failed email:', err)
                    }
                })()

                console.log(`Payment failed for customer ${customerId}`)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }
    } catch (error) {
        console.error(`Error processing webhook ${event.type}:`, error)
        return new NextResponse('Webhook handler error', { status: 500 })
    }

    return NextResponse.json({ received: true })
}
