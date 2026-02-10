import type { Database } from './database.types'

export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadActivity = Database['public']['Tables']['lead_activities']['Row']

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiating'
  | 'won'
  | 'lost'

export type LeadPriorityScore = {
  score: number
  factors: string[]
}

export type LeadFilters = {
  status?: LeadStatus[]
  source?: Array<'ai_chat' | 'manual' | 'phone' | 'email' | 'referral'>
  minPriority?: number
  maxPriority?: number
  dateFrom?: string
  dateTo?: string
  search?: string
}
