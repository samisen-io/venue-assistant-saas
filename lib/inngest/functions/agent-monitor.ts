import { inngest } from '../client'
import { getAgentOrchestrator } from '@/lib/agent/orchestrator'
import { createClient } from '@/lib/supabase/server'

/**
 * Agent Monitor Function
 *
 * This function runs periodically to:
 * 1. Process pending vendor replies
 * 2. Send follow-up emails to non-responsive vendors
 * 3. Complete timed-out agent runs
 */
export const agentMonitor = inngest.createFunction(
  {
    id: 'agent-monitor',
    name: 'Agent Monitor - Process Active Agent Runs',
  },
  { cron: '0 */6 * * *' }, // Run every 6 hours
  async ({ step }) => {
    const orchestrator = getAgentOrchestrator()

    // Step 1: Get all active agent runs
    const activeRuns = await step.run('get-active-agent-runs', async () => {
      const supabase = await createClient()
      const { data: runs } = await (supabase as any)
        .from('agent_runs')
        .select('id, event_id, started_at, status')
        .in('status', ['running', 'pending'])
        .order('started_at', { ascending: true })

      return runs || []
    })

    if (activeRuns.length === 0) {
      return { message: 'No active agent runs to process' }
    }

    // Step 2: Process each active run
    const results = []
    for (const run of activeRuns) {
      const result = await step.run(`process-agent-run-${run.id}`, async () => {
        try {
          // Check agent status and send follow-ups if needed
          await orchestrator.checkAgentStatus(run.id)

          // Process any new vendor replies
          await orchestrator.processVendorReplies(run.id)

          return {
            agentRunId: run.id,
            success: true,
          }
        } catch (error: any) {
          console.error(`Error processing agent run ${run.id}:`, error)
          return {
            agentRunId: run.id,
            success: false,
            error: error.message,
          }
        }
      })

      results.push(result)
    }

    return {
      message: `Processed ${activeRuns.length} agent runs`,
      results,
    }
  }
)

/**
 * Process Vendor Reply Function
 *
 * This function is triggered when a vendor reply is received via webhook.
 * It extracts quotes and updates agent run statistics.
 */
export const processVendorReply = inngest.createFunction(
  {
    id: 'process-vendor-reply',
    name: 'Process Vendor Reply',
  },
  { event: 'vendor/reply.received' },
  async ({ event, step }) => {
    const { agentRunId, communicationId } = event.data

    if (!agentRunId) {
      return { message: 'No agent run ID provided' }
    }

    const orchestrator = getAgentOrchestrator()

    await step.run('process-reply', async () => {
      await orchestrator.processVendorReplies(agentRunId)
    })

    return {
      message: 'Vendor reply processed',
      agentRunId,
      communicationId,
    }
  }
)

/**
 * Send Follow-Up Function
 *
 * This function is scheduled to send follow-up emails after a delay.
 */
export const sendFollowUp = inngest.createFunction(
  {
    id: 'send-follow-up',
    name: 'Send Follow-Up Email',
  },
  { event: 'vendor/followup.scheduled' },
  async ({ event, step }) => {
    const { agentRunId, vendorId, delayHours } = event.data

    // Wait for the specified delay
    await step.sleep('wait-for-followup-delay', `${delayHours}h`)

    const orchestrator = getAgentOrchestrator()

    await step.run('check-and-send-followup', async () => {
      await orchestrator.checkAgentStatus(agentRunId)
    })

    return {
      message: 'Follow-up check completed',
      agentRunId,
      vendorId,
    }
  }
)
