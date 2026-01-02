import { Database } from './database.types'

// Helper type to extract table types from Database
type Tables = Database['public']['Tables']

// Vendor Quote types from database
export type VendorQuote = Tables['vendor_quotes']['Row']
export type VendorQuoteInsert = Tables['vendor_quotes']['Insert']
export type VendorQuoteUpdate = Tables['vendor_quotes']['Update']

// Quote status enum
export type QuoteStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'withdrawn'

// Quote breakdown item
export interface QuoteBreakdownItem {
  description: string
  quantity?: number
  unitCost?: number
  totalCost: number
  category?: string
}

// Extended Quote with related data
export interface VendorQuoteWithDetails extends VendorQuote {
  vendor?: {
    id: string
    name: string
    contact_email: string
    contact_name?: string
    reliability_score?: number
    vendor_services?: Array<{
      event_service_id: string
      event_services?: { name: string } | null
    }>
  }
  event?: {
    id: string
    event_name: string
    event_date: string
    budget_total: number
  }
  communication?: {
    id: string
    subject?: string
    received_at?: string
  }
  approver?: {
    id: string
    full_name?: string
    email: string
  }
}

// Quote comparison data
export interface QuoteComparison {
  eventId: string
  serviceId: string
  quotes: VendorQuoteWithDetails[]
  lowestCost: number
  highestCost: number
  averageCost: number
  recommendedQuoteId?: string
}

// Quote approval action
export interface QuoteApprovalAction {
  quoteId: string
  action: 'approve' | 'reject'
  reason?: string
  approvedBy: string
}

// Quote approval result
export interface QuoteApprovalResult {
  success: boolean
  quoteId: string
  eventVendorId?: string
  message?: string
  error?: string
}

// Quote extraction result from AI
export interface ExtractedQuoteData {
  totalCost: number
  breakdown?: QuoteBreakdownItem[]
  availabilityConfirmed?: boolean
  availableDate?: string
  setupTime?: string
  depositRequired?: number
  depositPercentage?: number
  paymentTerms?: string
  cancellationPolicy?: string
  additionalNotes?: string
  confidence?: number // AI confidence score (0-1)
}

// Quote filter options
export interface QuoteFilters {
  eventId?: string
  vendorId?: string
  status?: QuoteStatus
  serviceId?: string
  minCost?: number
  maxCost?: number
  dateFrom?: string
  dateTo?: string
}

// Quote statistics
export interface QuoteStats {
  totalQuotes: number
  pendingQuotes: number
  approvedQuotes: number
  rejectedQuotes: number
  averageQuoteValue: number
  quotesWithinBudget: number
  quotesOverBudget: number
}

// Quote validation result
export interface QuoteValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Quote notification payload
export interface QuoteNotification {
  quoteId: string
  eventId: string
  vendorName: string
  totalCost: number
  receivedAt: string
  requiresApproval: boolean
}
