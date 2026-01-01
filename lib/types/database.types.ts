export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    company_name: string | null
                    phone: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    company_name?: string | null
                    phone?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    company_name?: string | null
                    phone?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            venues: {
                Row: {
                    id: string
                    owner_id: string
                    name: string
                    address: string | null
                    city: string | null
                    state: string | null
                    zip_code: string | null
                    phone: string | null
                    email: string | null
                    capacity: number | null
                    venue_type: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    owner_id: string
                    name: string
                    address?: string | null
                    city?: string | null
                    state?: string | null
                    zip_code?: string | null
                    phone?: string | null
                    email?: string | null
                    capacity?: number | null
                    venue_type?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    owner_id?: string
                    name?: string
                    address?: string | null
                    city?: string | null
                    state?: string | null
                    zip_code?: string | null
                    phone?: string | null
                    email?: string | null
                    capacity?: number | null
                    venue_type?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            vendors: {
                Row: {
                    id: string
                    venue_id: string
                    name: string
                    category: string
                    contact_name: string | null
                    contact_email: string
                    contact_phone: string | null
                    cost_structure: string | null
                    cost_per_unit: number | null
                    website: string | null
                    notes: string | null
                    reliability_score: number | null
                    total_events: number | null
                    on_time_count: number | null
                    on_time_percentage: number | null
                    avg_quality_rating: number | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    name: string
                    category: string
                    contact_name?: string | null
                    contact_email: string
                    contact_phone?: string | null
                    cost_structure?: string | null
                    cost_per_unit?: number | null
                    website?: string | null
                    notes?: string | null
                    reliability_score?: number | null
                    total_events?: number | null
                    on_time_count?: number | null
                    on_time_percentage?: number | null
                    avg_quality_rating?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    name?: string
                    category?: string
                    contact_name?: string | null
                    contact_email?: string
                    contact_phone?: string | null
                    cost_structure?: string | null
                    cost_per_unit?: number | null
                    website?: string | null
                    notes?: string | null
                    reliability_score?: number | null
                    total_events?: number | null
                    on_time_count?: number | null
                    on_time_percentage?: number | null
                    avg_quality_rating?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            events: {
                Row: {
                    id: string
                    venue_id: string
                    event_name: string
                    event_type: string
                    event_date: string
                    event_time: string | null
                    guest_count: number
                    budget_total: number
                    budget_breakdown: Json | null
                    actual_spent: number | null
                    status: string | null
                    description: string | null
                    special_requirements: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    event_name: string
                    event_type: string
                    event_date: string
                    event_time?: string | null
                    guest_count: number
                    budget_total: number
                    budget_breakdown?: Json | null
                    actual_spent?: number | null
                    status?: string | null
                    description?: string | null
                    special_requirements?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    event_name?: string
                    event_type?: string
                    event_date?: string
                    event_time?: string | null
                    guest_count?: number
                    budget_total?: number
                    budget_breakdown?: Json | null
                    actual_spent?: number | null
                    status?: string | null
                    description?: string | null
                    special_requirements?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            event_vendors: {
                Row: {
                    id: string
                    event_id: string
                    vendor_id: string
                    category: string
                    assignment_type: string | null
                    quoted_cost: number | null
                    actual_cost: number | null
                    confirmed: boolean | null
                    confirmed_at: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    event_id: string
                    vendor_id: string
                    category: string
                    assignment_type?: string | null
                    quoted_cost?: number | null
                    actual_cost?: number | null
                    confirmed?: boolean | null
                    confirmed_at?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    event_id?: string
                    vendor_id?: string
                    category?: string
                    assignment_type?: string | null
                    quoted_cost?: number | null
                    actual_cost?: number | null
                    confirmed?: boolean | null
                    confirmed_at?: string | null
                    created_at?: string | null
                }
            }
            vendor_reviews: {
                Row: {
                    id: string
                    event_id: string
                    vendor_id: string
                    on_time: boolean | null
                    quality_rating: number | null
                    cost_accurate: boolean | null
                    would_use_again: boolean | null
                    notes: string | null
                    reviewed_at: string | null
                }
                Insert: {
                    id?: string
                    event_id: string
                    vendor_id: string
                    on_time?: boolean | null
                    quality_rating?: number | null
                    cost_accurate?: boolean | null
                    would_use_again?: boolean | null
                    notes?: string | null
                    reviewed_at?: string | null
                }
                Update: {
                    id?: string
                    event_id?: string
                    vendor_id?: string
                    on_time?: boolean | null
                    quality_rating?: number | null
                    cost_accurate?: boolean | null
                    would_use_again?: boolean | null
                    notes?: string | null
                    reviewed_at?: string | null
                }
            }
            vendor_communications: {
                Row: {
                    id: string
                    event_id: string
                    vendor_id: string
                    thread_id: string | null
                    direction: string
                    subject: string | null
                    body: string
                    from_email: string
                    to_email: string
                    sent_at: string | null
                    received_at: string | null
                    read_at: string | null
                    status: string | null
                    processed: boolean | null
                    requires_followup: boolean | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    event_id: string
                    vendor_id: string
                    thread_id?: string | null
                    direction: string
                    subject?: string | null
                    body: string
                    from_email: string
                    to_email: string
                    sent_at?: string | null
                    received_at?: string | null
                    read_at?: string | null
                    status?: string | null
                    processed?: boolean | null
                    requires_followup?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    event_id?: string
                    vendor_id?: string
                    thread_id?: string | null
                    direction?: string
                    subject?: string | null
                    body?: string
                    from_email?: string
                    to_email?: string
                    sent_at?: string | null
                    received_at?: string | null
                    read_at?: string | null
                    status?: string | null
                    processed?: boolean | null
                    requires_followup?: boolean | null
                    created_at?: string | null
                }
            }
            vendor_quotes: {
                Row: {
                    id: string
                    event_id: string
                    vendor_id: string
                    communication_id: string | null
                    total_cost: number
                    breakdown: Json | null
                    availability_confirmed: boolean | null
                    available_date: string | null
                    setup_time: string | null
                    deposit_required: number | null
                    deposit_percentage: number | null
                    payment_terms: string | null
                    cancellation_policy: string | null
                    additional_notes: string | null
                    status: string | null
                    approved_by: string | null
                    approved_at: string | null
                    rejected_reason: string | null
                    raw_email_text: string | null
                    extracted_at: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    event_id: string
                    vendor_id: string
                    communication_id?: string | null
                    total_cost: number
                    breakdown?: Json | null
                    availability_confirmed?: boolean | null
                    available_date?: string | null
                    setup_time?: string | null
                    deposit_required?: number | null
                    deposit_percentage?: number | null
                    payment_terms?: string | null
                    cancellation_policy?: string | null
                    additional_notes?: string | null
                    status?: string | null
                    approved_by?: string | null
                    approved_at?: string | null
                    rejected_reason?: string | null
                    raw_email_text?: string | null
                    extracted_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    event_id?: string
                    vendor_id?: string
                    communication_id?: string | null
                    total_cost?: number
                    breakdown?: Json | null
                    availability_confirmed?: boolean | null
                    available_date?: string | null
                    setup_time?: string | null
                    deposit_required?: number | null
                    deposit_percentage?: number | null
                    payment_terms?: string | null
                    cancellation_policy?: string | null
                    additional_notes?: string | null
                    status?: string | null
                    approved_by?: string | null
                    approved_at?: string | null
                    rejected_reason?: string | null
                    raw_email_text?: string | null
                    extracted_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            agent_runs: {
                Row: {
                    id: string
                    event_id: string
                    trigger_type: string | null
                    status: string | null
                    started_at: string | null
                    completed_at: string | null
                    last_activity_at: string | null
                    vendors_targeted: number | null
                    vendors_contacted: number | null
                    vendors_responded: number | null
                    quotes_received: number | null
                    error_count: number | null
                    last_error_message: string | null
                    last_error_at: string | null
                    logs: Json | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    event_id: string
                    trigger_type?: string | null
                    status?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                    last_activity_at?: string | null
                    vendors_targeted?: number | null
                    vendors_contacted?: number | null
                    vendors_responded?: number | null
                    quotes_received?: number | null
                    error_count?: number | null
                    last_error_message?: string | null
                    last_error_at?: string | null
                    logs?: Json | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    event_id?: string
                    trigger_type?: string | null
                    status?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                    last_activity_at?: string | null
                    vendors_targeted?: number | null
                    vendors_contacted?: number | null
                    vendors_responded?: number | null
                    quotes_received?: number | null
                    error_count?: number | null
                    last_error_message?: string | null
                    last_error_at?: string | null
                    logs?: Json | null
                    created_at?: string | null
                }
            }
        }
    }
}
