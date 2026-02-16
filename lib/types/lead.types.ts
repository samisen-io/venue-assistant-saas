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

export type LeadSource = 'ai_chat' | 'manual' | 'phone' | 'email' | 'referral' | 'public_inquiry'

export type LeadFilters = {
  status?: LeadStatus[]
  source?: LeadSource[]
  minPriority?: number
  maxPriority?: number
  dateFrom?: string
  dateTo?: string
  search?: string
}

export type MarketplaceInquiryData = {
  event_description?: string
  budget_range?: string
  request_site_tour?: boolean
  receive_pricing_info?: boolean
  subscribe_to_updates?: boolean
  privacy_agreed?: boolean
  referrer?: string
  session_id?: string
}
