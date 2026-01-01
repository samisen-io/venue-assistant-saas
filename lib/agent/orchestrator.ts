import { createClient } from '@/lib/supabase/server'
import {
  AgentRun,
  AgentRunInsert,
  AgentRunUpdate,
  AgentLogEntry,
  StartAgentPayload,
  AgentActionResult,
} from '@/lib/types/agent.types'
import { Vendor } from '@/lib/types'
import { sendVendorOutreach, sendFollowUpEmail } from './vendorCommunicator'
import { analyzeVendorReply, extractQuoteFromReply } from './quoteExtractor'
import { getVendorState, canSendFollowUp } from './stateMachine'

/**
 * Main Agent Orchestrator
 * Coordinates the AI agent workflow for vendor communication
 */
export class AgentOrchestrator {
  /**
   * Start a new agent run for an event
   */
  async startAgent(payload: StartAgentPayload): Promise<AgentActionResult> {
    const supabase = await createClient()

    try {
      const { eventId, triggerType = 'manual', vendorIds } = payload

      // Validate event exists
      const { data: event, error: eventError} = await (supabase as any)
        .from('events')
        .select('*, venue:venues(*)')
        .eq('id', eventId)
        .single()

      if (eventError || !event) {
        return {
          success: false,
          error: 'Event not found',
        }
      }

      // Get vendors for the venue
      const { data: allVendors, error: vendorsError } = await (supabase as any)
        .from('vendors')
        .select('*')
        .eq('venue_id', event.venue.id)

      if (vendorsError) {
        return {
          success: false,
          error: 'Failed to fetch vendors',
        }
      }

      // Filter vendors if specific IDs provided, otherwise use all vendors
      let targetVendors = allVendors || []
      if (vendorIds && vendorIds.length > 0) {
        targetVendors = targetVendors.filter((v: any) => vendorIds.includes(v.id))
      }

      if (targetVendors.length === 0) {
        return {
          success: false,
          error: 'No vendors available for this venue',
        }
      }

      // Wrap vendors in the expected format (agent expects vendor property)
      targetVendors = targetVendors.map((v: any) => ({ vendor: v }))

      // Create agent run
      const agentRun: AgentRunInsert = {
        event_id: eventId,
        trigger_type: triggerType,
        status: 'running',
        vendors_targeted: targetVendors.length,
        vendors_contacted: 0,
        vendors_responded: 0,
        quotes_received: 0,
        logs: [],
      }

      const { data: createdRun, error: createError } = await (supabase as any)
        .from('agent_runs')
        .insert(agentRun)
        .select()
        .single()

      if (createError || !createdRun) {
        return {
          success: false,
          error: 'Failed to create agent run',
        }
      }

      // Log agent start
      await this.addLog(createdRun.id, {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Agent started for event: ${event.event_name}`,
        details: {
          vendorsTargeted: targetVendors.length,
          triggerType,
        },
      })

      // Start contacting vendors (don't await - run in background)
      this.contactVendors(createdRun.id, event, targetVendors).catch(error => {
        console.error('Error in contactVendors:', error)
        this.handleAgentError(createdRun.id, error)
      })

      return {
        success: true,
        agentRunId: createdRun.id,
        message: `Agent started successfully. Contacting ${targetVendors.length} vendors.`,
      }
    } catch (error: any) {
      console.error('Error starting agent:', error)
      return {
        success: false,
        error: error.message || 'Failed to start agent',
      }
    }
  }

  /**
   * Contact vendors for an agent run
   */
  private async contactVendors(
    agentRunId: string,
    event: any,
    matchedVendors: any[]
  ): Promise<void> {
    let contactedCount = 0

    for (const mv of matchedVendors) {
      try {
        const vendor = mv.vendor as Vendor

        // Send outreach email
        const result = await sendVendorOutreach({
          vendor,
          event,
          venueName: event.venue.name,
          agentRunId,
        })

        if (result.success) {
          contactedCount++
          await this.addLog(agentRunId, {
            timestamp: new Date().toISOString(),
            level: 'success',
            message: `Contacted vendor: ${vendor.name}`,
            details: {
              vendorId: vendor.id,
              communicationId: result.communicationId,
            },
          })
        } else {
          await this.addLog(agentRunId, {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `Failed to contact vendor: ${vendor.name}`,
            details: {
              vendorId: vendor.id,
              error: result.error,
            },
          })
        }

        // Add small delay between emails to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error: any) {
        await this.addLog(agentRunId, {
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Error contacting vendor: ${error.message}`,
        })
      }
    }

    // Update agent run with contacted count
    await this.updateAgentRun(agentRunId, {
      vendors_contacted: contactedCount,
      last_activity_at: new Date().toISOString(),
    })

    await this.addLog(agentRunId, {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Completed initial outreach. Contacted ${contactedCount} of ${matchedVendors.length} vendors.`,
    })
  }

  /**
   * Process vendor replies
   */
  async processVendorReplies(agentRunId: string): Promise<void> {
    const supabase = await createClient()

    try {
      // Get agent run details
      const { data: agentRun } = await (supabase as any)
        .from('agent_runs')
        .select('*, event:events(*)')
        .eq('id', agentRunId)
        .single()

      if (!agentRun) return

      // Get unprocessed vendor communications
      const { data: communications } = await (supabase as any)
        .from('vendor_communications')
        .select('*, vendor:vendors(*)')
        .eq('event_id', agentRun.event_id)
        .eq('direction', 'inbound')
        .eq('processed', false)

      if (!communications || communications.length === 0) return

      let respondedCount = 0
      let quotesReceived = 0

      for (const comm of communications) {
        try {
          // Analyze the reply
          const analysis = await analyzeVendorReply({
            emailBody: comm.body,
            vendorName: comm.vendor.name,
            eventName: agentRun.event.event_name,
          })

          // If has quote, extract it
          if (analysis.hasQuote) {
            const quote = await extractQuoteFromReply({
              emailBody: comm.body,
              vendorName: comm.vendor.name,
              vendorCategory: comm.vendor.category,
              eventDetails: {
                eventName: agentRun.event.event_name,
                eventDate: agentRun.event.event_date,
                guestCount: agentRun.event.guest_count,
              },
              communicationId: comm.id,
              eventId: agentRun.event_id,
              vendorId: comm.vendor_id,
            })

            if (quote.success) {
              quotesReceived++
              await this.addLog(agentRunId, {
                timestamp: new Date().toISOString(),
                level: 'success',
                message: `Quote received from ${comm.vendor.name}: $${quote.totalCost}`,
                details: {
                  vendorId: comm.vendor_id,
                  quoteId: quote.quoteId,
                  totalCost: quote.totalCost,
                },
              })
            }
          }

          // Mark communication as processed
          await (supabase as any)
            .from('vendor_communications')
            .update({
              processed: true,
              requires_followup: analysis.needsFollowUp,
            })
            .eq('id', comm.id)

          respondedCount++
        } catch (error: any) {
          await this.addLog(agentRunId, {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `Error processing reply from ${comm.vendor.name}`,
            details: { error: error.message },
          })
        }
      }

      // Update agent run stats
      await this.updateAgentRun(agentRunId, {
        vendors_responded: (agentRun.vendors_responded || 0) + respondedCount,
        quotes_received: (agentRun.quotes_received || 0) + quotesReceived,
        last_activity_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error processing vendor replies:', error)
      throw error
    }
  }

  /**
   * Check agent status and determine if follow-ups are needed
   */
  async checkAgentStatus(agentRunId: string): Promise<AgentRun | null> {
    const supabase = await createClient()

    try {
      const { data: agentRun } = await (supabase as any)
        .from('agent_runs')
        .select('*, event:events(*)')
        .eq('id', agentRunId)
        .single()

      if (!agentRun) return null

      // Get vendor states
      const { data: communications } = await (supabase as any)
        .from('vendor_communications')
        .select('*, vendor:vendors(*)')
        .eq('event_id', agentRun.event_id)

      if (!communications) return agentRun

      // Group communications by vendor
      const vendorComms = communications.reduce((acc: any, comm: any) => {
        if (!acc[comm.vendor_id]) {
          acc[comm.vendor_id] = []
        }
        acc[comm.vendor_id].push(comm)
        return acc
      }, {} as Record<string, any[]>)

      // Check each vendor for follow-ups
      const followUpDelay = parseInt(process.env.AGENT_FOLLOWUP_DELAY_HOURS || '24')

      for (const [vendorId, comms] of Object.entries(vendorComms)) {
        const state = getVendorState(comms as any)

        if (canSendFollowUp(comms as any, followUpDelay)) {
          const vendor = (comms as any)[0].vendor

          // Send follow-up
          await sendFollowUpEmail({
            vendor,
            event: agentRun.event,
            venueName: agentRun.event.venue?.name || '',
            previousCommunications: comms as any,
            agentRunId,
          })

          await this.addLog(agentRunId, {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Sent follow-up to ${vendor.name}`,
            details: { vendorId, state },
          })
        }
      }

      // Check if agent run is complete
      const timeoutHours = parseInt(process.env.AGENT_TIMEOUT_HOURS || '72')

      const startedAt = new Date(agentRun.started_at!)
      const hoursSinceStart = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60)

      if (hoursSinceStart > timeoutHours) {
        await this.completeAgentRun(agentRunId, 'Timeout reached')
      }

      return agentRun
    } catch (error) {
      console.error('Error checking agent status:', error)
      return null
    }
  }

  /**
   * Complete an agent run
   */
  private async completeAgentRun(agentRunId: string, reason: string): Promise<void> {
    await this.updateAgentRun(agentRunId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    })

    await this.addLog(agentRunId, {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Agent run completed: ${reason}`,
    })
  }

  /**
   * Handle agent error
   */
  private async handleAgentError(agentRunId: string, error: any): Promise<void> {
    const errorMessage = error.message || 'Unknown error'

    await this.updateAgentRun(agentRunId, {
      status: 'failed',
      error_count: 1,
      last_error_message: errorMessage,
      last_error_at: new Date().toISOString(),
    })

    await this.addLog(agentRunId, {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: `Agent run failed: ${errorMessage}`,
    })
  }

  /**
   * Update agent run
   */
  private async updateAgentRun(agentRunId: string, update: AgentRunUpdate): Promise<void> {
    const supabase = await createClient()
    await (supabase as any).from('agent_runs').update(update).eq('id', agentRunId)
  }

  /**
   * Add log entry to agent run
   */
  private async addLog(agentRunId: string, logEntry: AgentLogEntry): Promise<void> {
    const supabase = await createClient()

    // Get current logs
    const { data: agentRun } = await (supabase as any)
      .from('agent_runs')
      .select('logs')
      .eq('id', agentRunId)
      .single()

    if (!agentRun) return

    const logs = (agentRun.logs as AgentLogEntry[]) || []
    logs.push(logEntry)

    // Keep only last 100 log entries
    const trimmedLogs = logs.slice(-100)

    await (supabase as any).from('agent_runs').update({ logs: trimmedLogs }).eq('id', agentRunId)
  }
}

// Export singleton instance
let orchestratorInstance: AgentOrchestrator | null = null

export function getAgentOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator()
  }
  return orchestratorInstance
}
