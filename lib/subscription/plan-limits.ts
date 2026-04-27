import { PLAN_LIMITS, PlanTier } from '@/lib/stripe/config'

export function getPlanLimits(tier: PlanTier | string) {
    if (tier === 'appsumo_tier_1') return PLAN_LIMITS.starter
    if (tier === 'appsumo_tier_2') return PLAN_LIMITS.professional
    if (tier === 'appsumo_tier_3') return PLAN_LIMITS.enterprise
    return PLAN_LIMITS[tier as PlanTier] || PLAN_LIMITS.trial
}
