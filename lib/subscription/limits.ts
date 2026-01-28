import { createServiceRoleClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, PlanTier } from '@/lib/stripe/config'

export function getPlanLimits(tier: PlanTier) {
    return PLAN_LIMITS[tier] || PLAN_LIMITS.trial
}

async function getUserSubscription(userId: string) {
    const supabase = createServiceRoleClient()
    const { data } = await (supabase as any)
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
    return data as { plan_tier: string; status: string; trial_ends_at: string | null } | null
}

async function getCurrentUsage(userId: string) {
    const supabase = createServiceRoleClient()
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
    const { data } = await (supabase as any)
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .single()
    return (data as { spaces_created: number; events_created: number; vendors_created: number } | null)
        || { spaces_created: 0, events_created: 0, vendors_created: 0 }
}

export async function canCreateSpace(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
        return { allowed: false, reason: 'No active subscription. Please subscribe to a plan.' }
    }
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        return { allowed: false, reason: 'Your subscription is not active. Please update your billing.' }
    }
    const limits = getPlanLimits(subscription.plan_tier as PlanTier)
    if (limits.maxSpaces === Infinity) return { allowed: true }

    const usage = await getCurrentUsage(userId)
    if (usage.spaces_created >= limits.maxSpaces) {
        return { allowed: false, reason: `You've reached your limit of ${limits.maxSpaces} space(s). Upgrade your plan to add more.` }
    }
    return { allowed: true }
}

export async function canCreateEvent(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
        return { allowed: false, reason: 'No active subscription. Please subscribe to a plan.' }
    }
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        return { allowed: false, reason: 'Your subscription is not active. Please update your billing.' }
    }
    const limits = getPlanLimits(subscription.plan_tier as PlanTier)
    if (limits.maxEventsPerMonth === Infinity) return { allowed: true }

    const usage = await getCurrentUsage(userId)
    if (usage.events_created >= limits.maxEventsPerMonth) {
        return { allowed: false, reason: `You've reached your limit of ${limits.maxEventsPerMonth} events this month. Upgrade your plan for more.` }
    }
    return { allowed: true }
}

export async function canCreateVendor(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
        return { allowed: false, reason: 'No active subscription. Please subscribe to a plan.' }
    }
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        return { allowed: false, reason: 'Your subscription is not active. Please update your billing.' }
    }
    const limits = getPlanLimits(subscription.plan_tier as PlanTier)
    if (limits.maxVendors === Infinity) return { allowed: true }

    const usage = await getCurrentUsage(userId)
    if (usage.vendors_created >= limits.maxVendors) {
        return { allowed: false, reason: `You've reached your limit of ${limits.maxVendors} vendors. Upgrade your plan for more.` }
    }
    return { allowed: true }
}
