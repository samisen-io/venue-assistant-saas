import { createServiceRoleClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { TRIAL_DURATION_DAYS } from '@/lib/stripe/config'

export async function createTrialSubscription(userId: string, email: string, fullName?: string) {
    const supabase = createServiceRoleClient()

    // Check if subscription already exists (prevent duplicates)
    const { data: existingSubscription } = await (supabase as any)
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single()

    if (existingSubscription) {
        // User already has a subscription, return it
        const { data } = await (supabase as any)
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single()
        return data
    }

    // User is authenticated (OTP verified), so auth.users row exists
    // Check if profile exists (may have been created by DB trigger)
    const { data: existingProfile } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

    if (!existingProfile) {
        // Profile doesn't exist — create it using service role (bypasses RLS)
        const { error: insertError } = await (supabase as any)
            .from('profiles')
            .insert({
                id: userId,
                email,
                full_name: fullName || '',
            })

        // Ignore duplicate key error (23505) - means trigger created it
        if (insertError && insertError.code !== '23505') {
            console.error('Profile creation failed:', insertError)
            throw new Error(`Profile creation failed: ${insertError.message}`)
        }
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
    })

    // Calculate trial end date
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DURATION_DAYS)

    // Create subscription record
    const { data, error } = await (supabase as any)
        .from('subscriptions')
        .insert({
            user_id: userId,
            stripe_customer_id: customer.id,
            plan_tier: 'trial',
            status: 'trialing',
            trial_ends_at: trialEndsAt.toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: trialEndsAt.toISOString(),
        })
        .select()
        .single()

    if (error) {
        console.error('Failed to create trial subscription:', error)
        throw error
    }

    return data
}

export async function isTrialActive(userId: string): Promise<boolean> {
    const supabase = createServiceRoleClient()
    const { data } = await (supabase as any)
        .from('subscriptions')
        .select('status, trial_ends_at')
        .eq('user_id', userId)
        .single()

    if (!data || data.status !== 'trialing') return false
    if (!data.trial_ends_at) return false

    return new Date(data.trial_ends_at) > new Date()
}

export async function getDaysRemainingInTrial(userId: string): Promise<number> {
    const supabase = createServiceRoleClient()
    const { data } = await (supabase as any)
        .from('subscriptions')
        .select('trial_ends_at')
        .eq('user_id', userId)
        .single()

    if (!data?.trial_ends_at) return 0

    const remaining = new Date(data.trial_ends_at).getTime() - Date.now()
    return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)))
}

export async function hasTrialExpired(userId: string): Promise<boolean> {
    const days = await getDaysRemainingInTrial(userId)
    return days === 0
}
