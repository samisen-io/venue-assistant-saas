/**
 * Vendor Outreach Lifecycle Types
 *
 * These types support the complete vendor communication lifecycle from
 * initial contact through final confirmation or rejection.
 */

/**
 * The possible statuses in the vendor outreach lifecycle
 */
export type VendorOutreachStatus =
    | 'pending'         // Not yet contacted
    | 'contacted'       // Initial outreach sent
    | 'available'       // Vendor responded positively, quote within budget
    | 'not_available'   // Vendor declined or unavailable
    | 'needs_attention' // Vendor available but quoted over budget
    | 'confirmed'       // Venue manager confirmed the vendor
    | 'rejected';       // Venue manager rejected the vendor

/**
 * Status metadata for display purposes
 */
export interface VendorOutreachStatusInfo {
    label: string;
    description: string;
    color: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    icon: string; // Lucide icon name
    isTerminal: boolean;
}

/**
 * Represents a transition in the vendor outreach lifecycle
 */
export interface VendorOutreachTransition {
    from: VendorOutreachStatus | null;
    to: VendorOutreachStatus;
    timestamp: string;
    triggeredBy: 'manual' | 'ai_agent' | 'vendor_response' | 'system';
    triggeredByUserId?: string;
    notes?: string;
}

/**
 * Context for processing vendor outreach actions
 */
export interface VendorOutreachContext {
    eventVendorId: string;
    vendorId: string;
    eventId: string;
    currentStatus: VendorOutreachStatus;
    quotedCost?: number;
    budgetForService?: number;
    isOverBudget: boolean;
    budgetVariancePercent?: number;
}

/**
 * Actions available based on current status
 */
export type VendorOutreachAction =
    | 'contact'           // Send initial contact email
    | 'mark_available'    // Manually mark as available
    | 'mark_not_available'// Manually mark as not available
    | 'confirm'           // Confirm the vendor
    | 'reject'            // Reject the vendor
    | 're_contact'        // Re-contact after rejection/not_available
    | 'view_thread'       // View communication thread
    | 'update_quote';     // Update quoted cost

/**
 * Result of a budget comparison
 */
export type BudgetComparisonResult = 'within' | 'over' | 'under' | 'unknown';

/**
 * Budget comparison details
 */
export interface BudgetComparison {
    result: BudgetComparisonResult;
    quotedCost: number;
    budgetAmount: number;
    varianceAmount: number;
    variancePercent: number;
    shouldFlagAttention: boolean;
}

/**
 * Payload for contacting a vendor
 */
export interface ContactVendorPayload {
    eventVendorId: string;
    customMessage?: string;
    isFollowUp?: boolean;
}

/**
 * Payload for recording a vendor response
 */
export interface VendorResponsePayload {
    eventVendorId: string;
    responseType: 'available' | 'not_available';
    quotedAmount?: number;
    notes?: string;
}

/**
 * Payload for confirming or rejecting a vendor
 */
export interface VendorDecisionPayload {
    eventVendorId: string;
    action: 'confirm' | 'reject';
    reason?: string;
    sendNotification?: boolean;
}

/**
 * Result of a vendor outreach operation
 */
export interface VendorOutreachResult {
    success: boolean;
    eventVendorId: string;
    newStatus: VendorOutreachStatus;
    communicationId?: string;
    error?: string;
}

/**
 * Extended event vendor with related data for display
 */
export interface EventVendorWithDetails {
    id: string;
    event_id: string;
    vendor_id: string;
    event_service_id: string;
    assignment_type: string | null;
    quoted_cost: number | null;
    actual_cost: number | null;
    confirmed: boolean | null;
    confirmed_at: string | null;
    outreach_status: VendorOutreachStatus | null;
    status_updated_at: string | null;
    status_notes: string | null;
    contacted_at: string | null;
    vendor_response_at: string | null;
    rejection_reason: string | null;
    created_at: string | null;
    // Joined data
    vendor?: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        category: string | null;
        cost_per_unit: number | null;
        reliability_score: number | null;
    };
    event_service?: {
        id: string;
        name: string;
    };
    budget_allocation?: {
        budget_amount: number | null;
    };
    communication_count?: number;
    last_communication_at?: string | null;
}

/**
 * Filter options for vendor lists
 */
export interface VendorOutreachFilters {
    status?: VendorOutreachStatus[];
    hasEmail?: boolean;
    overBudget?: boolean;
    serviceId?: string;
}
