import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const url = new URL(request.url)
    const range = url.searchParams.get('range') ?? '30d'
    const startParam = url.searchParams.get('start')
    const endParam = url.searchParams.get('end')

    const now = new Date()
    let start: Date
    let end: Date = new Date()

    if (startParam && endParam) {
      start = new Date(startParam)
      end = new Date(endParam)
    } else {
      if (range === '7d') start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      else if (range === '90d') start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      else start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    // normalize times
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    const supabase = createServiceRoleClient()

    async function countEvent(eventType: string) {
      const { count, error } = await (supabase as any)
        .from('page_analytics')
        .select('*', { count: 'exact', head: false })
        .eq('venue_id', venueId)
        .eq('event_type', eventType)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())

      if (error) {
        console.error('countEvent error', error)
        return 0
      }
      return count ?? 0
    }

    const [pageViews, chatsOpened, leadsCaptured, ctaClicks] = await Promise.all([
      countEvent('page_view'),
      countEvent('chat_opened'),
      countEvent('lead_captured'),
      countEvent('cta_click'),
    ])

    // previous period for simple trend: same length directly before start
    const periodMs = end.getTime() - start.getTime() + 1
    const prevEnd = new Date(start.getTime() - 1)
    const prevStart = new Date(prevEnd.getTime() - periodMs + 1)

    async function countEventRange(eventType: string, s: Date, e: Date) {
      const { count } = await (supabase as any)
        .from('page_analytics')
        .select('*', { count: 'exact', head: false })
        .eq('venue_id', venueId)
        .eq('event_type', eventType)
        .gte('created_at', s.toISOString())
        .lte('created_at', e.toISOString())
      return count ?? 0
    }

    const [pvPrev, chatPrev, leadPrev, ctaPrev] = await Promise.all([
      countEventRange('page_view', prevStart, prevEnd),
      countEventRange('chat_opened', prevStart, prevEnd),
      countEventRange('lead_captured', prevStart, prevEnd),
      countEventRange('cta_click', prevStart, prevEnd),
    ])

    function trend(current: number, previous: number) {
      if (previous === 0) return null
      return ((current - previous) / previous) * 100
    }

    return NextResponse.json({
      range: { start: start.toISOString(), end: end.toISOString() },
      metrics: {
        page_views: { value: pageViews, trend: trend(pageViews, pvPrev) },
        chat_opened: { value: chatsOpened, trend: trend(chatsOpened, chatPrev) },
        leads_captured: { value: leadsCaptured, trend: trend(leadsCaptured, leadPrev) },
        cta_clicks: { value: ctaClicks, trend: trend(ctaClicks, ctaPrev) },
      },
    })
  } catch (err) {
    console.error('Analytics API error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
