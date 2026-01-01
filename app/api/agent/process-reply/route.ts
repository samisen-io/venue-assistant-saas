import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAgentOrchestrator } from '@/lib/agent/orchestrator'

/**
 * POST /api/agent/process-reply
 * Process vendor replies for an agent run
 */
export async function POST(request: NextRequest) {
  const supabase = createServerClient()

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

    // Parse request body
    const body = await request.json()
    const { agentRunId } = body

    // Validate input
    if (!agentRunId) {
      return NextResponse.json({ error: 'Missing agentRunId' }, { status: 400 })
    }

    // Verify agent run exists and belongs to user
    const { data: agentRun, error: agentError } = await supabase
      .from('agent_runs')
      .select('id, event:events(venue:venues(owner_id))')
      .eq('id', agentRunId)
      .single()

    if (agentError || !agentRun) {
      return NextResponse.json({ error: 'Agent run not found' }, { status: 404 })
    }

    // Check ownership
    if (agentRun.event?.venue?.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Process vendor replies
    const orchestrator = getAgentOrchestrator()
    await orchestrator.processVendorReplies(agentRunId)

    return NextResponse.json({
      success: true,
      message: 'Vendor replies processed successfully',
    })
  } catch (error: any) {
    console.error('Error processing vendor replies:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
