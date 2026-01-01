import { VendorCommunication } from '@/lib/types'
import { VendorCommunicationState } from '@/lib/types/agent.types'

/**
 * State Machine for Vendor Communication Workflow
 * Manages vendor states and determines valid state transitions
 */

/**
 * Get the current state of a vendor based on their communication history
 */
export function getVendorState(communications: VendorCommunication[]): VendorCommunicationState {
  if (communications.length === 0) {
    return 'pending'
  }

  // Sort communications by date (most recent first)
  const sorted = [...communications].sort((a, b) => {
    const dateA = new Date(a.sent_at || a.created_at!).getTime()
    const dateB = new Date(b.sent_at || b.created_at!).getTime()
    return dateB - dateA
  })

  const lastCommunication = sorted[0]
  const hasOutbound = communications.some(c => c.direction === 'outbound')
  const hasInbound = communications.some(c => c.direction === 'inbound')

  // Check for error state
  if (communications.some(c => c.status === 'failed' || c.status === 'bounced')) {
    return 'error'
  }

  // Check for quote received
  if (hasInbound && lastCommunication.direction === 'inbound') {
    // Need to check if associated with a quote in vendor_quotes table
    // For now, we'll mark as responded
    return 'responded'
  }

  // Check for follow-up sent
  const outboundCount = communications.filter(c => c.direction === 'outbound').length
  if (outboundCount > 1 && hasOutbound && !hasInbound) {
    return 'followup_sent'
  }

  // Check for initial contact
  if (hasOutbound && !hasInbound) {
    return 'contacted'
  }

  // Check for no response
  if (hasOutbound && !hasInbound) {
    const daysSinceContact = getDaysSinceLastOutbound(communications)
    if (daysSinceContact > 7) {
      return 'no_response'
    }
    return 'contacted'
  }

  return 'pending'
}

/**
 * Determine if a state transition is valid
 */
export function isValidTransition(
  currentState: VendorCommunicationState,
  nextState: VendorCommunicationState
): boolean {
  const validTransitions: Record<VendorCommunicationState, VendorCommunicationState[]> = {
    pending: ['contacted', 'error'],
    contacted: ['responded', 'followup_sent', 'no_response', 'error'],
    responded: ['quoted', 'followup_sent', 'declined', 'error'],
    quoted: ['followup_sent', 'declined', 'error'],
    followup_sent: ['responded', 'quoted', 'no_response', 'error'],
    no_response: ['responded', 'quoted', 'error'],
    declined: ['error'], // Terminal state except for errors
    error: ['contacted', 'followup_sent'], // Can retry after error
  }

  return validTransitions[currentState]?.includes(nextState) || false
}

/**
 * Get the next recommended action for a vendor state
 */
export function getRecommendedAction(state: VendorCommunicationState): string {
  const actions: Record<VendorCommunicationState, string> = {
    pending: 'Send initial outreach email',
    contacted: 'Wait for response or send follow-up after 3-5 days',
    responded: 'Analyze response and extract quote if available',
    quoted: 'Present quote to user for approval',
    followup_sent: 'Wait for response',
    no_response: 'Send final follow-up or mark as unavailable',
    declined: 'Find alternative vendor',
    error: 'Review error and retry or mark as failed',
  }

  return actions[state] || 'No action needed'
}

/**
 * Determine if a follow-up email should be sent
 */
export function canSendFollowUp(
  communications: VendorCommunication[],
  followUpDelayHours: number = 72 // Default 3 days
): boolean {
  if (communications.length === 0) {
    return false
  }

  const state = getVendorState(communications)

  // Don't send follow-up if already responded or in terminal states
  if (['responded', 'quoted', 'declined', 'error'].includes(state)) {
    return false
  }

  // Get last outbound communication
  const outbound = communications
    .filter(c => c.direction === 'outbound')
    .sort((a, b) => {
      const dateA = new Date(a.sent_at || a.created_at!).getTime()
      const dateB = new Date(b.sent_at || b.created_at!).getTime()
      return dateB - dateA
    })

  if (outbound.length === 0) {
    return false
  }

  const lastOutbound = outbound[0]
  const hoursSinceLastOutbound = getHoursSince(lastOutbound.sent_at || lastOutbound.created_at!)

  // Check if enough time has passed
  if (hoursSinceLastOutbound < followUpDelayHours) {
    return false
  }

  // Check if we've hit max retries
  const maxRetries = parseInt(process.env.AGENT_MAX_RETRIES || '3')
  if (outbound.length >= maxRetries) {
    return false
  }

  // Check if there's been any inbound communication since last outbound
  const inbound = communications.filter(c => c.direction === 'inbound')
  if (inbound.length > 0) {
    const lastInbound = inbound.sort((a, b) => {
      const dateA = new Date(a.received_at || a.created_at!).getTime()
      const dateB = new Date(b.received_at || b.created_at!).getTime()
      return dateB - dateA
    })[0]

    const inboundDate = new Date(lastInbound.received_at || lastInbound.created_at!).getTime()
    const outboundDate = new Date(lastOutbound.sent_at || lastOutbound.created_at!).getTime()

    // Don't follow up if vendor has responded since our last message
    if (inboundDate > outboundDate) {
      return false
    }
  }

  return true
}

/**
 * Get days since last outbound communication
 */
export function getDaysSinceLastOutbound(communications: VendorCommunication[]): number {
  const outbound = communications
    .filter(c => c.direction === 'outbound')
    .sort((a, b) => {
      const dateA = new Date(a.sent_at || a.created_at!).getTime()
      const dateB = new Date(b.sent_at || b.created_at!).getTime()
      return dateB - dateA
    })

  if (outbound.length === 0) {
    return 0
  }

  const lastDate = new Date(outbound[0].sent_at || outbound[0].created_at!)
  const now = new Date()
  return Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Get hours since a specific date
 */
function getHoursSince(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60)
}

/**
 * Calculate vendor response metrics
 */
export function calculateVendorMetrics(communications: VendorCommunication[]): {
  responseRate: number
  averageResponseTimeHours: number
  totalOutbound: number
  totalInbound: number
} {
  const outbound = communications.filter(c => c.direction === 'outbound')
  const inbound = communications.filter(c => c.direction === 'inbound')

  const responseRate = outbound.length > 0 ? (inbound.length / outbound.length) * 100 : 0

  // Calculate average response time
  let totalResponseTime = 0
  let responseCount = 0

  for (const inboundComm of inbound) {
    // Find the most recent outbound before this inbound
    const inboundDate = new Date(inboundComm.received_at || inboundComm.created_at!)

    const priorOutbound = outbound
      .filter(out => {
        const outDate = new Date(out.sent_at || out.created_at!)
        return outDate < inboundDate
      })
      .sort((a, b) => {
        const dateA = new Date(a.sent_at || a.created_at!).getTime()
        const dateB = new Date(b.sent_at || b.created_at!).getTime()
        return dateB - dateA
      })[0]

    if (priorOutbound) {
      const outboundDate = new Date(priorOutbound.sent_at || priorOutbound.created_at!)
      const responseTime = (inboundDate.getTime() - outboundDate.getTime()) / (1000 * 60 * 60)
      totalResponseTime += responseTime
      responseCount++
    }
  }

  const averageResponseTimeHours = responseCount > 0 ? totalResponseTime / responseCount : 0

  return {
    responseRate,
    averageResponseTimeHours,
    totalOutbound: outbound.length,
    totalInbound: inbound.length,
  }
}

/**
 * Get vendor communication summary
 */
export function getVendorCommunicationSummary(communications: VendorCommunication[]): {
  state: VendorCommunicationState
  recommendedAction: string
  canFollowUp: boolean
  daysSinceContact: number
  metrics: ReturnType<typeof calculateVendorMetrics>
} {
  const state = getVendorState(communications)
  const followUpDelayHours = parseInt(process.env.AGENT_FOLLOWUP_DELAY_HOURS || '72')

  return {
    state,
    recommendedAction: getRecommendedAction(state),
    canFollowUp: canSendFollowUp(communications, followUpDelayHours),
    daysSinceContact: getDaysSinceLastOutbound(communications),
    metrics: calculateVendorMetrics(communications),
  }
}
