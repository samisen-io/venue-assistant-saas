import { Database } from './database.types'

// Core database types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Venue = Database['public']['Tables']['venues']['Row']
export type Space = Database['public']['Tables']['spaces']['Row']
export type Vendor = Database['public']['Tables']['vendors']['Row']
export type EventService = Database['public']['Tables']['event_services']['Row']
export type VendorService = Database['public']['Tables']['vendor_services']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type EventServiceRequirement = Database['public']['Tables']['event_service_requirements']['Row']
export type EventVendor = Database['public']['Tables']['event_vendors']['Row']
export type VendorReview = Database['public']['Tables']['vendor_reviews']['Row']

// AI feature database types
export type VendorCommunication = Database['public']['Tables']['vendor_communications']['Row']
export type VendorQuote = Database['public']['Tables']['vendor_quotes']['Row']
export type AgentRun = Database['public']['Tables']['agent_runs']['Row']

// Re-export AI feature types
export * from './agent.types'
export * from './communication.types'
export * from './quote.types'

export type VendorMatchResult = {
    vendor: Vendor
    score: number
    estimated_cost: number
    reasons: string[]
}

export type BudgetBreakdown = {
    event_service_id: string
    event_service_name: string
    budgeted: number
    quoted: number
    actual: number
    variance: number
}

export type BudgetSummary = {
    budget_total: number
    breakdown: BudgetBreakdown[]
    total_quoted: number
    total_actual: number
    variance_percentage: number
    status: "UNDER_BUDGET" | "ON_TRACK" | "OVER_BUDGET"
}

export type SpaceType =
    | "ballroom"
    | "conference_room"
    | "meeting_room"
    | "outdoor_garden"
    | "rooftop"
    | "banquet_hall"
    | "other"

export type EventStatus =
    | "planning"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
