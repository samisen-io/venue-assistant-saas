import { Database } from './database.types'

// Helper type to extract table types from Database
type Tables = Database['public']['Tables']

// Vendor Communication types from database
export type VendorCommunication = Tables['vendor_communications']['Row']
export type VendorCommunicationInsert = Tables['vendor_communications']['Insert']
export type VendorCommunicationUpdate = Tables['vendor_communications']['Update']

// Communication direction enum
export type CommunicationDirection = 'outbound' | 'inbound'

// Communication status enum
export type CommunicationStatus =
  | 'sent'
  | 'delivered'
  | 'bounced'
  | 'replied'
  | 'failed'

// Extended Communication with related data
export interface VendorCommunicationWithDetails extends VendorCommunication {
  vendor?: {
    id: string
    name: string
    contact_email: string
    vendor_services?: Array<{
      event_service_id: string
      event_services?: { name: string } | null
    }>
  }
  event?: {
    id: string
    event_name: string
    event_date: string
  }
}

// Communication thread structure
export interface CommunicationThread {
  threadId: string
  vendorId: string
  vendorName: string
  eventId: string
  messages: VendorCommunication[]
  latestMessage?: VendorCommunication
  unreadCount: number
  hasQuote: boolean
}

// Email draft structure
export interface EmailDraft {
  to: string
  from: string
  subject: string
  body: string
  threadId?: string
  metadata?: {
    eventId: string
    vendorId: string
    purpose: 'outreach' | 'followup' | 'confirmation' | 'inquiry'
  }
}

// Email template variables
export interface EmailTemplateVariables {
  vendorName: string
  venueName: string
  eventName: string
  eventDate: string
  eventType: string
  guestCount: number
  budget?: number
  specialRequirements?: string
  contactName?: string
  services?: string
  [key: string]: any
}

// Email sending result
export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
  communicationId?: string
}

// Communication filter options
export interface CommunicationFilters {
  eventId?: string
  vendorId?: string
  direction?: CommunicationDirection
  status?: CommunicationStatus
  processed?: boolean
  requiresFollowup?: boolean
  threadId?: string
  dateFrom?: string
  dateTo?: string
}

// Communication statistics
export interface CommunicationStats {
  totalSent: number
  totalReceived: number
  responseRate: number
  averageResponseTime: number // in hours
  unprocessedCount: number
  requiresFollowupCount: number
}

// Email parser result
export interface ParsedEmail {
  from: string
  to: string
  subject: string
  body: string
  threadId?: string
  inReplyTo?: string
  references?: string[]
  receivedAt: string
  attachments?: EmailAttachment[]
}

// Email attachment
export interface EmailAttachment {
  filename: string
  contentType: string
  size: number
  url?: string
}
