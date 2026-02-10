import type { Database, Json } from './database.types'

export type Proposal = Database['public']['Tables']['proposals']['Row']

export type ProposalStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'expired'

export type PricingLineItem = {
  label: string
  quantity?: number
  unitPrice?: number
  amount: number
  metadata?: Json
}

export type PricingBreakdown = {
  currency?: string
  subtotal: number
  taxes?: number
  fees?: number
  discount?: number
  total: number
  lineItems: PricingLineItem[]
}
