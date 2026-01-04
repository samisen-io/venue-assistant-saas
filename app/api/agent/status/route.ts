import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAgentOrchestrator } from '@/lib/agent/orchestrator'

/**
 * GET /api/agent/status?agentRunId=xxx
 * Get status of an agent run
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

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
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const agentRunId = searchParams.get('agentRunId')

    // Validate input
    if (!agentRunId) {
      return NextResponse.json({ error: 'Missing agentRunId' }, { status: 400 })
    }

    // Verify agent run exists and belongs to user
    const { data: agentRun, error: agentError } = await (supabase as any)
      .from('agent_runs')
      .select('*, event:events(id, event_name, venue:venues(owner_id))')
      .eq('id', agentRunId)
      .single()

    if (agentError || !agentRun) {
      return NextResponse.json({ error: 'Agent run not found' }, { status: 404 })
    }

    // Check ownership
    if ((agentRun as any).event?.venue?.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check status and potentially trigger follow-ups
    const orchestrator = getAgentOrchestrator()
    const updatedRun = await orchestrator.checkAgentStatus(agentRunId)

    return NextResponse.json({
      success: true,
      data: updatedRun || agentRun,
    })
  } catch (error: any) {
    console.error('Error getting agent status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agent/status
 * Update agent run status (pause, resume, cancel)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { agentRunId, action } = body

    // Validate input
    if (!agentRunId || !action) {
      return NextResponse.json(
        { error: 'Missing agentRunId or action' },
        { status: 400 }
      )
    }

    if (!['pause', 'resume', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Verify agent run exists and belongs to user
    const { data: agentRun, error: agentError } = await (supabase as any)
      .from('agent_runs')
      .select('id, event:events(venue:venues(owner_id))')
      .eq('id', agentRunId)
      .single()

    if (agentError || !agentRun) {
      return NextResponse.json({ error: 'Agent run not found' }, { status: 404 })
    }

    // Check ownership
    if ((agentRun as any).event?.venue?.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update status based on action
    let newStatus: string
    switch (action) {
      case 'pause':
        newStatus = 'paused'
        break
      case 'resume':
        newStatus = 'running'
        break
      case 'cancel':
        newStatus = 'failed'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update the agent run
    const { error: updateError } = await (supabase as any)
      .from('agent_runs')
      .update({
        status: newStatus,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', agentRunId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: `Agent run ${action}d successfully`,
    })
  } catch (error: any) {
    console.error('Error updating agent status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
