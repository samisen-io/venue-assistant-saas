import { Database } from './database.types'

// Helper type to extract table types from Database
type Tables = Database['public']['Tables']

// Agent Run types from database
export type AgentRun = Tables['agent_runs']['Row']
export type AgentRunInsert = Tables['agent_runs']['Insert']
export type AgentRunUpdate = Tables['agent_runs']['Update']

// Agent Run status enum
export type AgentRunStatus = 'running' | 'completed' | 'failed' | 'paused'

// Agent Run trigger types
export type AgentTriggerType = 'manual' | 'scheduled' | 'webhook' | 'event_created'

// Agent log entry structure
export interface AgentLogEntry {
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  details?: Record<string, any>
}

// Extended Agent Run with vendor details
export interface AgentRunWithDetails extends AgentRun {
  event?: {
    id: string
    event_name: string
    event_date: string
    venue_id: string
  }
}

// Agent metrics for dashboard
export interface AgentMetrics {
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  activeRuns: number
  averageQuotesPerRun: number
  averageResponseRate: number
}

// Agent action payload for starting an agent
export interface StartAgentPayload {
  eventId: string
  triggerType?: AgentTriggerType
  vendorIds?: string[] // Optional: specify which vendors to contact
}

// Agent action result
export interface AgentActionResult {
  success: boolean
  agentRunId?: string
  message?: string
  error?: string
}

// Vendor communication state for agent
export type VendorCommunicationState =
  | 'pending'       // Not yet contacted
  | 'contacted'     // Initial email sent
  | 'responded'     // Vendor replied
  | 'quoted'        // Quote received
  | 'followup_sent' // Follow-up sent
  | 'no_response'   // No response after retries
  | 'declined'      // Vendor declined
  | 'error'         // Error in communication

// Vendor state in agent workflow
export interface VendorAgentState {
  vendorId: string
  vendorName: string
  state: VendorCommunicationState
  lastContactedAt?: string
  responseReceivedAt?: string
  quoteId?: string
  retryCount: number
  errorMessage?: string
}
