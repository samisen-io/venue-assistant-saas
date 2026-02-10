import { NextResponse } from 'next/server'
import { fetchVenuePublicPageData } from '@/lib/public-page/fetchPublicVenue'
import { trackEvent } from '@/lib/analytics/tracker'
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/utils/rateLimit'

const TRACK_RATE_LIMIT = { limit: 200, windowSeconds: 60, identifier: 'public-track' }

const ALLOWED_EVENTS = new Set([
  'page_view',
  'chat_opened',
  'lead_captured',
  'cta_click',
  'gallery_view',
  'calendar_click',
  'phone_click',
  'email_click',
  'scroll_depth',
  'element_click',
  'social_click',
])

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(ip, TRACK_RATE_LIMIT)
    if (!rl.success) return rateLimitResponse(rl)

    const { slug } = await params
    const body = await request.json().catch(() => ({})) as any

    const eventType = typeof body.eventType === 'string' ? body.eventType : body.event_type
    const metadata = body.metadata ?? {}
    const sessionId = body.sessionId ?? body.session_id ?? null

    if (!eventType || typeof eventType !== 'string') {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 })
    }

    if (!ALLOWED_EVENTS.has(eventType)) {
      return NextResponse.json({ error: 'Invalid eventType' }, { status: 400 })
    }

    const venueData = await fetchVenuePublicPageData({ slug, publishedOnly: true })
    if (!venueData) return NextResponse.json({ error: 'Venue not found' }, { status: 404 })

    await trackEvent({
      venueId: venueData.venue.id,
      eventType,
      metadata,
      referrer: request.headers.get('referer') ?? null,
      userAgent: request.headers.get('user-agent') ?? null,
      ip,
      sessionId,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Public track error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
