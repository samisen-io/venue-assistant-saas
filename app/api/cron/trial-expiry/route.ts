/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { generateTrialExpiringSubject, generateTrialExpiringHTML } from '@/lib/email/templates/trialExpiring'

/**
 * Trial Expiry Cron Job
 *
 * Sends warning emails to users whose trial ends in exactly 3 or 1 day(s).
 * Schedule: run daily (e.g. Vercel cron: "0 9 * * *" — 9 AM UTC)
 * Protected by CRON_SECRET in production.
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createServiceRoleClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const results = { sent: 0, skipped: 0, errors: 0 }

  for (const daysRemaining of [3, 1]) {
    // Find subscriptions whose trial ends in exactly `daysRemaining` days
    // We use a 25-hour window to be safe against cron timing drift
    const windowStart = new Date()
    windowStart.setDate(windowStart.getDate() + daysRemaining - 1)
    windowStart.setHours(0, 0, 0, 0)

    const windowEnd = new Date()
    windowEnd.setDate(windowEnd.getDate() + daysRemaining)
    windowEnd.setHours(23, 59, 59, 999)

    const { data: expiringSubs, error } = await (supabase as any)
      .from('subscriptions')
      .select('user_id, trial_ends_at')
      .eq('status', 'trialing')
      .eq('plan_tier', 'trial')
      .gte('trial_ends_at', windowStart.toISOString())
      .lte('trial_ends_at', windowEnd.toISOString())

    if (error) {
      console.error(`Trial expiry cron: query error for ${daysRemaining}d window:`, error)
      results.errors++
      continue
    }

    for (const sub of expiringSubs || []) {
      try {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('email, full_name')
          .eq('id', sub.user_id)
          .single()

        if (!profile?.email) {
          results.skipped++
          continue
        }

        await sendEmail({
          to: profile.email,
          from: process.env.RESEND_FROM_EMAIL || 'noreply@venuemanager.com',
          subject: generateTrialExpiringSubject({ fullName: profile.full_name || '', daysRemaining, upgradeUrl: '' }),
          body: generateTrialExpiringHTML({
            fullName: profile.full_name || '',
            daysRemaining,
            upgradeUrl: `${baseUrl}/dashboard/settings/billing`,
          }),
        })

        results.sent++
      } catch (err) {
        console.error(`Trial expiry cron: failed to email user ${sub.user_id}:`, err)
        results.errors++
      }
    }
  }

  console.log('Trial expiry cron completed:', results)
  return NextResponse.json({ ok: true, ...results })
}
