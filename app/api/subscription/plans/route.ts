import { NextResponse } from 'next/server'
import { PLANS } from '@/lib/stripe/config'

export async function GET() {
    // Return plans with price IDs (safe to expose price IDs publicly)
    const plans = PLANS.map(plan => ({
        name: plan.name,
        tier: plan.tier,
        priceId: plan.priceId,
        priceMonthly: plan.priceMonthly,
        features: plan.features,
    }))

    return NextResponse.json(plans)
}
