import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AgentDashboard } from '@/components/agent/AgentDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface AgentPageProps {
  params: {
    eventId: string
  }
}

export default async function AgentPage({ params }: AgentPageProps) {
  const supabase = await createClient()

  // Get event details
  const { data: event, error: eventError } = await (supabase as any)
    .from('events')
    .select(`
      *,
      venue:venues(*)
    `)
    .eq('id', params.eventId)
    .single()

  if (eventError || !event) {
    redirect('/dashboard/events')
  }

  // Get active agent runs for this event
  const { data: agentRuns } = await (supabase as any)
    .from('agent_runs')
    .select('*')
    .eq('event_id', params.eventId)
    .order('started_at', { ascending: false })

  // Get vendor communications for this event
  const { data: communications } = await (supabase as any)
    .from('vendor_communications')
    .select(`
      *,
      vendor:vendors(*)
    `)
    .eq('event_id', params.eventId)
    .order('created_at', { ascending: false })

  // Get vendors for this event's venue
  const { data: vendors } = await (supabase as any)
    .from('vendors')
    .select(`
      *,
      vendor_services (
        event_service_id,
        event_services (id, name, slug)
      )
    `)
    .eq('venue_id', event.venue_id)

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/events/${params.eventId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Event
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">AI Agent - Vendor Outreach</h1>
          <p className="text-muted-foreground">
            Automated vendor communication for {event.event_name}
          </p>
        </div>
      </div>

      {/* Feature Flag Check */}
      {process.env.ENABLE_AI_AGENT !== 'true' && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle>AI Agent Disabled</CardTitle>
            <CardDescription>
              The AI agent feature is currently disabled. Enable it in your environment configuration.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Agent Dashboard */}
      <AgentDashboard
        event={event}
        agentRuns={agentRuns || []}
        communications={communications || []}
        vendors={vendors || []}
      />
    </div>
  )
}
