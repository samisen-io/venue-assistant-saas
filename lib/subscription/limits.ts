import { createServiceRoleClient } from '@/lib/supabase/server'
import { PlanTier } from '@/lib/stripe/config'
export { getPlanLimits } from '@/lib/subscription/plan-limits'
import { getPlanLimits } from './plan-limits'

function checkSubscriptionStatus(subscription: any) {
    if (!subscription) {
        return { allowed: false, reason: 'No active subscription. Please subscribe to a plan.' }
    }
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        return { allowed: false, reason: 'Your subscription is not active. Please update your billing.' }
    }
    if (subscription.status === 'trialing' && subscription.trial_ends_at && new Date(subscription.trial_ends_at).getTime() < Date.now()) {
        return { allowed: false, reason: 'Your trial has expired. Please upgrade to a paid plan.' }
    }
    return { allowed: true }
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
    return (data as { venues_created: number; events_created: number; vendors_created: number } | null)
        || { venues_created: 0, events_created: 0, vendors_created: 0 }
}

/** @deprecated use canCreateVenue */
export async function canCreateSpace(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    return canCreateVenue(userId)
}

export async function canCreateVenue(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await getUserSubscription(userId)
    const statusCheck = checkSubscriptionStatus(subscription)
    if (!statusCheck.allowed) return statusCheck
    
    const limits = getPlanLimits(subscription!.plan_tier as PlanTier)
    if (limits.maxVenues === Infinity) return { allowed: true }

    // Count existing venues directly (not usage_tracking) for accuracy
    const supabase = createServiceRoleClient()
    const { count } = await (supabase as any)
        .from('venues')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', userId)
    if ((count ?? 0) >= limits.maxVenues) {
        return {
            allowed: false,
            reason: `You've reached your limit of ${limits.maxVenues} venue(s). Upgrade to Professional or Enterprise to add more.`,
        }
    }
    return { allowed: true }
}

export async function canCreateEvent(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await getUserSubscription(userId)
    const statusCheck = checkSubscriptionStatus(subscription)
    if (!statusCheck.allowed) return statusCheck
    
    const limits = getPlanLimits(subscription!.plan_tier as PlanTier)
    if (limits.maxEventsPerMonth === Infinity) return { allowed: true }

    const usage = await getCurrentUsage(userId)
    if (usage.events_created >= limits.maxEventsPerMonth) {
        return { allowed: false, reason: `You've reached your limit of ${limits.maxEventsPerMonth} events this month. Upgrade your plan for more.` }
    }
    return { allowed: true }
}

export async function canCreateVendor(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await getUserSubscription(userId)
    const statusCheck = checkSubscriptionStatus(subscription)
    if (!statusCheck.allowed) return statusCheck
    
    const limits = getPlanLimits(subscription!.plan_tier as PlanTier)
    if (limits.maxVendors === Infinity) return { allowed: true }

    const usage = await getCurrentUsage(userId)
    if (usage.vendors_created >= limits.maxVendors) {
        return { allowed: false, reason: `You've reached your limit of ${limits.maxVendors} vendors. Upgrade your plan for more.` }
    }
    return { allowed: true }
}

async function getUserVenueId(userId: string, preferredVenueId?: string): Promise<string | null> {
    const supabase = createServiceRoleClient()

    if (preferredVenueId) {
        const { data } = await (supabase as any)
            .from('venues')
            .select('id')
            .eq('id', preferredVenueId)
            .eq('owner_id', userId)
            .single()
        if (data) return (data as { id: string }).id
    }

    // Fall back to default or first venue
    const { data } = await (supabase as any)
        .from('venues')
        .select('id')
        .eq('owner_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single()
    return (data as { id: string } | null)?.id ?? null
}

export async function canUploadPhoto(userId: string, venueId?: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await getUserSubscription(userId)
    const statusCheck = checkSubscriptionStatus(subscription)
    if (!statusCheck.allowed) return statusCheck
    
    const limits = getPlanLimits(subscription!.plan_tier as PlanTier)
    if (limits.maxPhotos === Infinity) return { allowed: true }

    const resolvedVenueId = await getUserVenueId(userId, venueId)
    if (!resolvedVenueId) return { allowed: true }

    const supabase = createServiceRoleClient()
    const { count } = await (supabase as any)
        .from('venue_photos')
        .select('id', { count: 'exact', head: true })
        .eq('venue_id', resolvedVenueId)
    if ((count ?? 0) >= limits.maxPhotos) {
        return { allowed: false, reason: `You've reached your limit of ${limits.maxPhotos} photos. Upgrade your plan to upload more.` }
    }
    return { allowed: true }
}

export async function canSendChatMessage(userId: string, venueId?: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await getUserSubscription(userId)

    // For the public-facing chat, a missing or expired subscription falls back to
    // trial-tier limits rather than hard-blocking visitors from chatting.
    let effectiveTier: PlanTier = 'trial'
    if (subscription && checkSubscriptionStatus(subscription).allowed) {
        effectiveTier = subscription.plan_tier as PlanTier
    }

    const limits = getPlanLimits(effectiveTier)
    if (limits.maxAIChatMessagesPerMonth === Infinity) return { allowed: true }

    const resolvedVenueId = await getUserVenueId(userId, venueId)
    if (!resolvedVenueId) return { allowed: true }

    // conversation_messages has no venue_id; join through conversations
    const supabase = createServiceRoleClient()
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: convData } = await (supabase as any)
        .from('conversations')
        .select('id')
        .eq('venue_id', resolvedVenueId)

    const convIds = ((convData ?? []) as { id: string }[]).map((c) => c.id)
    if (convIds.length === 0) return { allowed: true }

    const { count } = await (supabase as any)
        .from('conversation_messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .eq('role', 'assistant')
        .gte('created_at', monthStart)

    if ((count ?? 0) >= limits.maxAIChatMessagesPerMonth) {
        return { allowed: false, reason: `You've reached your limit of ${limits.maxAIChatMessagesPerMonth} AI chat messages this month. Upgrade your plan for more.` }
    }
    return { allowed: true }
}

export async function canCreateLead(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await getUserSubscription(userId)
    const statusCheck = checkSubscriptionStatus(subscription)
    if (!statusCheck.allowed) return statusCheck
    
    const limits = getPlanLimits(subscription!.plan_tier as PlanTier)
    if (limits.maxLeadsPerMonth === Infinity) return { allowed: true }

    const venueId = await getUserVenueId(userId)
    if (!venueId) return { allowed: true }

    const supabase = createServiceRoleClient()
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { count } = await (supabase as any)
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('venue_id', venueId)
        .gte('created_at', monthStart)
    if ((count ?? 0) >= limits.maxLeadsPerMonth) {
        return { allowed: false, reason: `You've reached your limit of ${limits.maxLeadsPerMonth} leads this month. Upgrade your plan for more.` }
    }
    return { allowed: true }
}
