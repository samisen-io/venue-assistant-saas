import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function generateICal(events: any[]) {
    let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//VenueAssistant//EN\r\nCALSCALE:GREGORIAN\r\n'
    for (const event of events) {
        if (!event.start_time || !event.end_time) continue
        const dtstart = new Date(event.start_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        const dtend = new Date(event.end_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        ics += 'BEGIN:VEVENT\r\n'
        ics += `UID:${event.id}@venueassistant.com\r\n`
        ics += `DTSTAMP:${dtstamp}\r\n`
        ics += `DTSTART:${dtstart}\r\n`
        ics += `DTEND:${dtend}\r\n`
        ics += `SUMMARY:${event.event_name}\r\n`
        ics += `DESCRIPTION:Status: ${event.status}\r\n`
        ics += 'END:VEVENT\r\n'
    }
    ics += 'END:VCALENDAR'
    return ics
}

export async function GET(request: Request, { params }: { params: Promise<{ venueId: string }> }) {
    try {
        const { venueId } = await params
        
        // Since iCal feeds are fetched by external calendar apps (Google Calendar, Apple Calendar),
        // they will not have the user's auth session cookie.
        // We use the service role client and rely on the unguessable UUID as the secret.
        const supabase = createServiceRoleClient()
        
        const { data: venue } = await (supabase as any).from('venues').select('id, name').eq('id', venueId).single()
        if (!venue) return new Response('Venue not found', { status: 404 })

        const { data: events } = await (supabase as any).from('events')
            .select('*')
            .eq('venue_id', venueId)
            .neq('status', 'cancelled')

        const icsString = generateICal(events || [])

        return new Response(icsString, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="venue-${venueId}.ics"`,
            }
        })
    } catch (error) {
        console.error('Calendar generation error:', error)
        return new Response('Internal server error', { status: 500 })
    }
}
