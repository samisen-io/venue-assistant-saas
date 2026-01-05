import { NextRequest, NextResponse } from 'next/server'
import { getAgentOrchestrator } from '@/lib/agent/orchestrator'
import { createClient } from '@/lib/supabase/server'

/**
 * Agent Monitor Cron Job
 *
 * This endpoint is called periodically by Vercel Cron to:
 * 1. Process pending vendor replies
 * 2. Send follow-up emails
 * 3. Complete timed-out agent runs
 *
 * Security: This endpoint should be protected in production
 * using CRON_SECRET environment variable
 */

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret in production
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization')
      const cronSecret = process.env.CRON_SECRET

      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('Agent monitor cron job started')

    const orchestrator = getAgentOrchestrator()
    const supabase = await createClient()

    // Get all active agent runs
    const { data: activeRuns, error: runsError } = await (supabase as any)
      .from('agent_runs')
      .select('id, event_id, started_at, status')
      .in('status', ['running', 'pending'])
      .order('started_at', { ascending: true })

    if (runsError) {
      console.error('Error fetching active runs:', runsError)
      return NextResponse.json(
        { error: 'Failed to fetch active runs' },
        { status: 500 }
      )
    }

    if (!activeRuns || activeRuns.length === 0) {
      console.log('No active agent runs to process')
      return NextResponse.json({
        success: true,
        message: 'No active agent runs',
        processedRuns: 0,
      })
    }

    console.log(`Processing ${activeRuns.length} active agent runs`)

    // Process each active run
    const results = []
    for (const run of activeRuns) {
      try {
        console.log(`Processing agent run: ${run.id}`)

        // Check agent status and send follow-ups if needed
        await orchestrator.checkAgentStatus(run.id)

        // Process any new vendor replies
        await orchestrator.processVendorReplies(run.id)

        results.push({
          agentRunId: run.id,
          success: true,
        })

        console.log(`Successfully processed agent run: ${run.id}`)
      } catch (error: any) {
        console.error(`Error processing agent run ${run.id}:`, error)
        results.push({
          agentRunId: run.id,
          success: false,
          error: error.message,
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.log(
      `Agent monitor cron job completed: ${successCount} successful, ${failureCount} failed`
    )

    return NextResponse.json({
      success: true,
      message: `Processed ${activeRuns.length} agent runs`,
      processedRuns: activeRuns.length,
      successCount,
      failureCount,
      results,
    })
  } catch (error: any) {
    console.error('Error in agent monitor cron job:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to run agent monitor',
      },
      { status: 500 }
    )
  }
}
