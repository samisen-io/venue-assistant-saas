import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAgentOrchestrator } from '@/lib/agent/orchestrator'

/**
 * POST /api/agent/start
 * Start an AI agent run for an event
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  let user: any = null

  try {
    // Check if AI agent is enabled
    if (process.env.ENABLE_AI_AGENT !== 'true') {
      return NextResponse.json(
        { error: 'AI agent is not enabled' },
        { status: 403 }
      )
    }

    // Check authentication
    const {
      data: { user: authenticatedUser },
      error: authError,
    } = await supabase.auth.getUser()
    user = authenticatedUser

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { eventId, vendorIds, triggerType = 'manual' } = body

    // Validate input
    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })
    }

    // Verify event exists and belongs to user
    const { data: event, error: eventError } = await (supabase as any)
      .from('events')
      .select('id, venue:venues(owner_id)')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check ownership
    if (event.venue?.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Start the agent
    const orchestrator = getAgentOrchestrator()
    const result = await orchestrator.startAgent({
      eventId,
      vendorIds,
      triggerType,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to start agent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      agentRunId: result.agentRunId,
      message: result.message,
    })
  } catch (error: any) {
    // Comprehensive error logging
    console.error('❌ CRITICAL ERROR in /api/agent/start:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      requestBody: await request.clone().json().catch(() => null),
      userId: user?.id || 'unknown',
    })

    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        errorType: error.name,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
