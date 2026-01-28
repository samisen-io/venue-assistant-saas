export type PlanTier = 'trial' | 'starter' | 'professional' | 'enterprise'

export interface PlanLimits {
    maxSpaces: number
    maxEventsPerMonth: number
    maxVendors: number
    apiAccess: boolean
}

export interface PlanConfig {
    name: string
    tier: PlanTier
    priceId: string | null
    priceMonthly: number
    limits: PlanLimits
    features: string[]
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
    trial: {
        maxSpaces: 1,
        maxEventsPerMonth: 5,
        maxVendors: 10,
        apiAccess: false,
    },
    starter: {
        maxSpaces: 1,
        maxEventsPerMonth: 10,
        maxVendors: 50,
        apiAccess: false,
    },
    professional: {
        maxSpaces: 3,
        maxEventsPerMonth: 50,
        maxVendors: Infinity,
        apiAccess: false,
    },
    enterprise: {
        maxSpaces: Infinity,
        maxEventsPerMonth: Infinity,
        maxVendors: Infinity,
        apiAccess: true,
    },
}

export const PLANS: PlanConfig[] = [
    {
        name: 'Starter',
        tier: 'starter',
        priceId: process.env.STRIPE_STARTER_PRICE_ID || null,
        priceMonthly: 49,
        limits: PLAN_LIMITS.starter,
        features: [
            '1 space',
            '10 events per month',
            '50 vendors',
            'Budget tracking',
            'Vendor matching',
            'Email support',
        ],
    },
    {
        name: 'Professional',
        tier: 'professional',
        priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || null,
        priceMonthly: 149,
        limits: PLAN_LIMITS.professional,
        features: [
            '3 spaces',
            '50 events per month',
            'Unlimited vendors',
            'Budget tracking',
            'Vendor matching',
            'Priority support',
            'Advanced reporting',
        ],
    },
    {
        name: 'Enterprise',
        tier: 'enterprise',
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
        priceMonthly: 299,
        limits: PLAN_LIMITS.enterprise,
        features: [
            'Unlimited spaces',
            'Unlimited events',
            'Unlimited vendors',
            'Budget tracking',
            'Vendor matching',
            'Dedicated support',
            'API access',
            'Custom integrations',
        ],
    },
]

export const TRIAL_DURATION_DAYS = 14

export function getPlanByTier(tier: PlanTier): PlanConfig | undefined {
    return PLANS.find(p => p.tier === tier)
}

export function getPlanByPriceId(priceId: string): PlanConfig | undefined {
    return PLANS.find(p => p.priceId === priceId)
}
