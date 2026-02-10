import crypto from 'crypto'
import { createServiceRoleClient } from '@/lib/supabase/server'

type TrackEventParams = {
  venueId: string
  eventType: string
  metadata?: Record<string, any>
  referrer?: string | null
  userAgent?: string | null
  ip?: string | null
  sessionId?: string | null
}

export async function trackEvent({ venueId, eventType, metadata, referrer, userAgent, ip, sessionId }: TrackEventParams) {
  const supabase = createServiceRoleClient()

  const ipHash = ip ? hashIp(ip) : null

  const { data, error } = await (supabase as any).from('page_analytics').insert({
    venue_id: venueId,
    event_type: eventType,
    metadata: metadata ?? {},
    referrer: referrer ?? null,
    user_agent: userAgent ?? null,
    ip_hash: ipHash,
    session_id: sessionId ?? null
  })

  if (error) {
    console.error('trackEvent insert error', error)
  }

  return { data, error }
}

function hashIp(ip: string) {
  const salt = process.env.ANALYTICS_IP_SALT ?? 'default-salt'
  return crypto.createHash('sha256').update(ip + salt).digest('hex')
}

export default { trackEvent }
