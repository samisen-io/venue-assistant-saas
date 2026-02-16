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
                    description: string | null
                    website: string | null
                    contact_name: string | null
                    slug: string | null
                    tagline: string | null
                    hero_image_url: string | null
                    page_status: string | null
                    latitude: number | null
                    longitude: number | null
                    social_links: Json | null
                    privacy_settings: Json | null
                    business_hours: Json | null
                    seo_title: string | null
                    seo_description: string | null
                    seo_keywords: string | null
                    og_image_url: string | null
                    google_analytics_id: string | null
                    facebook_pixel_id: string | null
                    view_count: number | null
                    inquiry_count: number | null
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
                    description?: string | null
                    website?: string | null
                    contact_name?: string | null
                    slug?: string | null
                    tagline?: string | null
                    hero_image_url?: string | null
                    page_status?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    social_links?: Json | null
                    privacy_settings?: Json | null
                    business_hours?: Json | null
                    seo_title?: string | null
                    seo_description?: string | null
                    seo_keywords?: string | null
                    og_image_url?: string | null
                    google_analytics_id?: string | null
                    facebook_pixel_id?: string | null
                    view_count?: number | null
                    inquiry_count?: number | null
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
                    description?: string | null
                    website?: string | null
                    contact_name?: string | null
                    slug?: string | null
                    tagline?: string | null
                    hero_image_url?: string | null
                    page_status?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    social_links?: Json | null
                    privacy_settings?: Json | null
                    business_hours?: Json | null
                    seo_title?: string | null
                    seo_description?: string | null
                    seo_keywords?: string | null
                    og_image_url?: string | null
                    google_analytics_id?: string | null
                    facebook_pixel_id?: string | null
                    view_count?: number | null
                    inquiry_count?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            clients: {
                Row: {
                    id: string
                    venue_id: string
                    company_name: string | null
                    contact_name: string
                    email: string | null
                    phone: string | null
                    notes: string | null
                    notify_on_booking_updates: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    company_name?: string | null
                    contact_name: string
                    email?: string | null
                    phone?: string | null
                    notes?: string | null
                    notify_on_booking_updates?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    company_name?: string | null
                    contact_name?: string
                    email?: string | null
                    phone?: string | null
                    notes?: string | null
                    notify_on_booking_updates?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            spaces: {
                Row: {
                    id: string
                    venue_id: string
                    name: string
                    capacity: number | null
                    space_type: string | null
                    floor_level: string | null
                    square_footage: number | null
                    hourly_rate: number | null
                    setup_time_minutes: number | null
                    cleanup_time_minutes: number | null
                    amenities: string[] | null
                    notes: string | null
                    is_active: boolean | null
                    capacity_standing: number | null
                    capacity_theater: number | null
                    capacity_custom: number | null
                    capacity_custom_label: string | null
                    photo_url: string | null
                    display_order: number | null
                    public_description: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    name: string
                    capacity?: number | null
                    space_type?: string | null
                    floor_level?: string | null
                    square_footage?: number | null
                    hourly_rate?: number | null
                    setup_time_minutes?: number | null
                    cleanup_time_minutes?: number | null
                    amenities?: string[] | null
                    notes?: string | null
                    is_active?: boolean | null
                    capacity_standing?: number | null
                    capacity_theater?: number | null
                    capacity_custom?: number | null
                    capacity_custom_label?: string | null
                    photo_url?: string | null
                    display_order?: number | null
                    public_description?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    name?: string
                    capacity?: number | null
                    space_type?: string | null
                    floor_level?: string | null
                    square_footage?: number | null
                    hourly_rate?: number | null
                    setup_time_minutes?: number | null
                    cleanup_time_minutes?: number | null
                    amenities?: string[] | null
                    notes?: string | null
                    is_active?: boolean | null
                    capacity_standing?: number | null
                    capacity_theater?: number | null
                    capacity_custom?: number | null
                    capacity_custom_label?: string | null
                    photo_url?: string | null
                    display_order?: number | null
                    public_description?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            vendors: {
                Row: {
                    id: string
                    venue_id: string
                    name: string
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
            event_services: {
                Row: {
                    id: string
                    venue_id: string
                    name: string
                    slug: string
                    description: string | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    name: string
                    slug: string
                    description?: string | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            vendor_services: {
                Row: {
                    vendor_id: string
                    event_service_id: string
                    created_at: string | null
                }
                Insert: {
                    vendor_id: string
                    event_service_id: string
                    created_at?: string | null
                }
                Update: {
                    vendor_id?: string
                    event_service_id?: string
                    created_at?: string | null
                }
            }
            events: {
                Row: {
                    id: string
                    space_id: string | null
                    client_id: string | null
                    venue_id: string
                    event_name: string
                    event_type: string
                    event_date: string
                    event_time: string | null
                    event_end_time: string | null
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
                    space_id?: string | null
                    client_id?: string | null
                    venue_id: string
                    event_name: string
                    event_type: string
                    event_date: string
                    event_time?: string | null
                    event_end_time?: string | null
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
                    space_id?: string | null
                    client_id?: string | null
                    venue_id?: string
                    event_name?: string
                    event_type?: string
                    event_date?: string
                    event_time?: string | null
                    event_end_time?: string | null
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
            event_service_requirements: {
                Row: {
                    id: string
                    event_id: string
                    event_service_id: string
                    budget_amount: number | null
                    notes: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    event_id: string
                    event_service_id: string
                    budget_amount?: number | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    event_id?: string
                    event_service_id?: string
                    budget_amount?: number | null
                    notes?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            event_vendors: {
                Row: {
                    id: string
                    event_id: string
                    vendor_id: string
                    event_service_id: string
                    assignment_type: string | null
                    quoted_cost: number | null
                    actual_cost: number | null
                    confirmed: boolean | null
                    confirmed_at: string | null
                    outreach_status: 'pending' | 'contacted' | 'available' | 'not_available' | 'needs_attention' | 'confirmed' | 'rejected' | null
                    status_updated_at: string | null
                    status_notes: string | null
                    contacted_at: string | null
                    vendor_response_at: string | null
                    rejection_reason: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    event_id: string
                    vendor_id: string
                    event_service_id: string
                    assignment_type?: string | null
                    quoted_cost?: number | null
                    actual_cost?: number | null
                    confirmed?: boolean | null
                    confirmed_at?: string | null
                    outreach_status?: 'pending' | 'contacted' | 'available' | 'not_available' | 'needs_attention' | 'confirmed' | 'rejected' | null
                    status_updated_at?: string | null
                    status_notes?: string | null
                    contacted_at?: string | null
                    vendor_response_at?: string | null
                    rejection_reason?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    event_id?: string
                    vendor_id?: string
                    event_service_id?: string
                    assignment_type?: string | null
                    quoted_cost?: number | null
                    actual_cost?: number | null
                    confirmed?: boolean | null
                    confirmed_at?: string | null
                    outreach_status?: 'pending' | 'contacted' | 'available' | 'not_available' | 'needs_attention' | 'confirmed' | 'rejected' | null
                    status_updated_at?: string | null
                    status_notes?: string | null
                    contacted_at?: string | null
                    vendor_response_at?: string | null
                    rejection_reason?: string | null
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
                    event_vendor_id: string | null
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
                    event_vendor_id?: string | null
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
                    event_vendor_id?: string | null
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
            client_communications: {
                Row: {
                    id: string
                    client_id: string
                    event_id: string | null
                    message_type: string
                    subject: string | null
                    body: string | null
                    sent_at: string | null
                    sent_by: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    client_id: string
                    event_id?: string | null
                    message_type: string
                    subject?: string | null
                    body?: string | null
                    sent_at?: string | null
                    sent_by?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    client_id?: string
                    event_id?: string | null
                    message_type?: string
                    subject?: string | null
                    body?: string | null
                    sent_at?: string | null
                    sent_by?: string | null
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
            venue_photos: {
                Row: {
                    id: string
                    venue_id: string
                    section_name: string
                    image_url: string
                    caption: string | null
                    alt_text: string | null
                    display_order: number | null
                    is_section_thumbnail: boolean | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    section_name?: string
                    image_url: string
                    caption?: string | null
                    alt_text?: string | null
                    display_order?: number | null
                    is_section_thumbnail?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    section_name?: string
                    image_url?: string
                    caption?: string | null
                    alt_text?: string | null
                    display_order?: number | null
                    is_section_thumbnail?: boolean | null
                    created_at?: string | null
                }
            }
            venue_amenities: {
                Row: {
                    id: string
                    venue_id: string
                    amenity_key: string
                    amenity_label: string
                    is_custom: boolean | null
                    extra_info: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    amenity_key: string
                    amenity_label: string
                    is_custom?: boolean | null
                    extra_info?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    amenity_key?: string
                    amenity_label?: string
                    is_custom?: boolean | null
                    extra_info?: string | null
                    created_at?: string | null
                }
            }
            venue_event_types: {
                Row: {
                    id: string
                    venue_id: string
                    event_type_key: string
                    event_type_label: string
                    is_custom: boolean | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    event_type_key: string
                    event_type_label: string
                    is_custom?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    event_type_key?: string
                    event_type_label?: string
                    is_custom?: boolean | null
                    created_at?: string | null
                }
            }
            venue_packages: {
                Row: {
                    id: string
                    venue_id: string
                    name: string
                    description: string | null
                    base_price: number
                    pricing_model: string | null
                    tiered_pricing: Json | null
                    inclusions: Json | null
                    is_visible_on_public_page: boolean | null
                    display_order: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    name: string
                    description?: string | null
                    base_price: number
                    pricing_model?: string | null
                    tiered_pricing?: Json | null
                    inclusions?: Json | null
                    is_visible_on_public_page?: boolean | null
                    display_order?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    name?: string
                    description?: string | null
                    base_price?: number
                    pricing_model?: string | null
                    tiered_pricing?: Json | null
                    inclusions?: Json | null
                    is_visible_on_public_page?: boolean | null
                    display_order?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            venue_package_addons: {
                Row: {
                    id: string
                    venue_id: string
                    name: string
                    description: string | null
                    price: number
                    available_with_packages: string[] | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    name: string
                    description?: string | null
                    price: number
                    available_with_packages?: string[] | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    available_with_packages?: string[] | null
                    created_at?: string | null
                }
            }
            venue_testimonials: {
                Row: {
                    id: string
                    venue_id: string
                    client_name: string
                    client_company: string | null
                    event_type: string | null
                    quote: string
                    star_rating: number | null
                    client_photo_url: string | null
                    event_date: string | null
                    event_id: string | null
                    is_published: boolean | null
                    display_order: number | null
                    source: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    client_name: string
                    client_company?: string | null
                    event_type?: string | null
                    quote: string
                    star_rating?: number | null
                    client_photo_url?: string | null
                    event_date?: string | null
                    event_id?: string | null
                    is_published?: boolean | null
                    display_order?: number | null
                    source?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    client_name?: string
                    client_company?: string | null
                    event_type?: string | null
                    quote?: string
                    star_rating?: number | null
                    client_photo_url?: string | null
                    event_date?: string | null
                    event_id?: string | null
                    is_published?: boolean | null
                    display_order?: number | null
                    source?: string | null
                    created_at?: string | null
                }
            }
            venue_availability: {
                Row: {
                    id: string
                    venue_id: string
                    date: string
                    status: string | null
                    note: string | null
                    event_id: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    date: string
                    status?: string | null
                    note?: string | null
                    event_id?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    date?: string
                    status?: string | null
                    note?: string | null
                    event_id?: string | null
                    created_at?: string | null
                }
            }
            venue_calendar_settings: {
                Row: {
                    id: string
                    venue_id: string
                    show_availability: boolean | null
                    setup_buffer_days: number | null
                    teardown_buffer_days: number | null
                    min_advance_booking_days: number | null
                    max_advance_booking_months: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    show_availability?: boolean | null
                    setup_buffer_days?: number | null
                    teardown_buffer_days?: number | null
                    min_advance_booking_days?: number | null
                    max_advance_booking_months?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    show_availability?: boolean | null
                    setup_buffer_days?: number | null
                    teardown_buffer_days?: number | null
                    min_advance_booking_days?: number | null
                    max_advance_booking_months?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            venue_blackout_dates: {
                Row: {
                    id: string
                    venue_id: string
                    start_date: string
                    end_date: string
                    reason: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    start_date: string
                    end_date: string
                    reason?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    start_date?: string
                    end_date?: string
                    reason?: string | null
                    created_at?: string | null
                }
            }
            venue_ai_settings: {
                Row: {
                    id: string
                    venue_id: string
                    tone: string | null
                    custom_tone_description: string | null
                    response_length: string | null
                    greeting_message: string | null
                    after_hours_message: string | null
                    business_hours_start: string | null
                    business_hours_end: string | null
                    business_days: number[] | null
                    suggest_alternative_dates: boolean | null
                    upsell_addons: boolean | null
                    mention_promotions: boolean | null
                    request_contact_after_messages: number | null
                    auto_send_proposal: boolean | null
                    escalate_capacity_threshold: number | null
                    escalate_min_days_away: number | null
                    escalate_on_budget_concerns: boolean | null
                    escalate_on_complex_questions: boolean | null
                    escalate_on_negative_sentiment: boolean | null
                    escalate_after_messages: number | null
                    show_pricing_in_chat: boolean | null
                    require_manager_approval_for_quotes: boolean | null
                    manager_name: string | null
                    manager_email: string | null
                    ai_pricing_rules: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    tone?: string | null
                    custom_tone_description?: string | null
                    response_length?: string | null
                    greeting_message?: string | null
                    after_hours_message?: string | null
                    business_hours_start?: string | null
                    business_hours_end?: string | null
                    business_days?: number[] | null
                    suggest_alternative_dates?: boolean | null
                    upsell_addons?: boolean | null
                    mention_promotions?: boolean | null
                    request_contact_after_messages?: number | null
                    auto_send_proposal?: boolean | null
                    escalate_capacity_threshold?: number | null
                    escalate_min_days_away?: number | null
                    escalate_on_budget_concerns?: boolean | null
                    escalate_on_complex_questions?: boolean | null
                    escalate_on_negative_sentiment?: boolean | null
                    escalate_after_messages?: number | null
                    show_pricing_in_chat?: boolean | null
                    require_manager_approval_for_quotes?: boolean | null
                    manager_name?: string | null
                    manager_email?: string | null
                    ai_pricing_rules?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    tone?: string | null
                    custom_tone_description?: string | null
                    response_length?: string | null
                    greeting_message?: string | null
                    after_hours_message?: string | null
                    business_hours_start?: string | null
                    business_hours_end?: string | null
                    business_days?: number[] | null
                    suggest_alternative_dates?: boolean | null
                    upsell_addons?: boolean | null
                    mention_promotions?: boolean | null
                    request_contact_after_messages?: number | null
                    auto_send_proposal?: boolean | null
                    escalate_capacity_threshold?: number | null
                    escalate_min_days_away?: number | null
                    escalate_on_budget_concerns?: boolean | null
                    escalate_on_complex_questions?: boolean | null
                    escalate_on_negative_sentiment?: boolean | null
                    escalate_after_messages?: number | null
                    show_pricing_in_chat?: boolean | null
                    require_manager_approval_for_quotes?: boolean | null
                    manager_name?: string | null
                    manager_email?: string | null
                    ai_pricing_rules?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            venue_page_versions: {
                Row: {
                    id: string
                    venue_id: string
                    version_number: number
                    snapshot: Json
                    published_by: string | null
                    change_summary: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    version_number: number
                    snapshot: Json
                    published_by?: string | null
                    change_summary?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    version_number?: number
                    snapshot?: Json
                    published_by?: string | null
                    change_summary?: string | null
                    created_at?: string | null
                }
            }
            page_analytics: {
                Row: {
                    id: string
                    venue_id: string
                    event_type: string
                    metadata: Json | null
                    referrer: string | null
                    user_agent: string | null
                    ip_hash: string | null
                    session_id: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    event_type: string
                    metadata?: Json | null
                    referrer?: string | null
                    user_agent?: string | null
                    ip_hash?: string | null
                    session_id?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    event_type?: string
                    metadata?: Json | null
                    referrer?: string | null
                    user_agent?: string | null
                    ip_hash?: string | null
                    session_id?: string | null
                    created_at?: string | null
                }
            }
            leads: {
                Row: {
                    id: string
                    venue_id: string
                    source: string | null
                    contact_name: string | null
                    contact_email: string | null
                    contact_phone: string | null
                    company: string | null
                    event_type: string | null
                    event_date: string | null
                    date_is_flexible: boolean | null
                    guest_count: number | null
                    estimated_budget: number | null
                    requirements: Json | null
                    status: string | null
                    lost_reason: string | null
                    priority_score: number | null
                    assigned_to: string | null
                    conversation_id: string | null
                    ai_insights: Json | null
                    notes: string | null
                    marketplace_inquiry_data: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    source?: string | null
                    contact_name?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    company?: string | null
                    event_type?: string | null
                    event_date?: string | null
                    date_is_flexible?: boolean | null
                    guest_count?: number | null
                    estimated_budget?: number | null
                    requirements?: Json | null
                    status?: string | null
                    lost_reason?: string | null
                    priority_score?: number | null
                    assigned_to?: string | null
                    conversation_id?: string | null
                    ai_insights?: Json | null
                    notes?: string | null
                    marketplace_inquiry_data?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    source?: string | null
                    contact_name?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    company?: string | null
                    event_type?: string | null
                    event_date?: string | null
                    date_is_flexible?: boolean | null
                    guest_count?: number | null
                    estimated_budget?: number | null
                    requirements?: Json | null
                    status?: string | null
                    lost_reason?: string | null
                    priority_score?: number | null
                    assigned_to?: string | null
                    conversation_id?: string | null
                    ai_insights?: Json | null
                    notes?: string | null
                    marketplace_inquiry_data?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            lead_activities: {
                Row: {
                    id: string
                    lead_id: string
                    activity_type: string
                    description: string
                    metadata: Json | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    lead_id: string
                    activity_type: string
                    description: string
                    metadata?: Json | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    lead_id?: string
                    activity_type?: string
                    description?: string
                    metadata?: Json | null
                    created_at?: string | null
                }
            }
            conversations: {
                Row: {
                    id: string
                    venue_id: string
                    prospect_email: string | null
                    prospect_name: string | null
                    prospect_phone: string | null
                    prospect_company: string | null
                    started_at: string | null
                    last_message_at: string | null
                    status: string | null
                    extracted_data: Json | null
                    lead_id: string | null
                    message_count: number | null
                    session_id: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    prospect_email?: string | null
                    prospect_name?: string | null
                    prospect_phone?: string | null
                    prospect_company?: string | null
                    started_at?: string | null
                    last_message_at?: string | null
                    status?: string | null
                    extracted_data?: Json | null
                    lead_id?: string | null
                    message_count?: number | null
                    session_id?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    prospect_email?: string | null
                    prospect_name?: string | null
                    prospect_phone?: string | null
                    prospect_company?: string | null
                    started_at?: string | null
                    last_message_at?: string | null
                    status?: string | null
                    extracted_data?: Json | null
                    lead_id?: string | null
                    message_count?: number | null
                    session_id?: string | null
                    created_at?: string | null
                }
            }
            conversation_messages: {
                Row: {
                    id: string
                    conversation_id: string
                    role: string
                    content: string
                    extracted_data: Json | null
                    suggested_actions: Json | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    role: string
                    content: string
                    extracted_data?: Json | null
                    suggested_actions?: Json | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    role?: string
                    content?: string
                    extracted_data?: Json | null
                    suggested_actions?: Json | null
                    created_at?: string | null
                }
            }
            proposals: {
                Row: {
                    id: string
                    lead_id: string
                    venue_id: string
                    reference_number: string
                    event_summary: Json
                    pricing_breakdown: Json
                    inclusions: Json | null
                    terms_and_policies: string | null
                    total_estimated: number | null
                    deposit_amount: number | null
                    valid_until: string | null
                    status: string | null
                    pdf_url: string | null
                    sent_at: string | null
                    viewed_at: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    lead_id: string
                    venue_id: string
                    reference_number: string
                    event_summary: Json
                    pricing_breakdown: Json
                    inclusions?: Json | null
                    terms_and_policies?: string | null
                    total_estimated?: number | null
                    deposit_amount?: number | null
                    valid_until?: string | null
                    status?: string | null
                    pdf_url?: string | null
                    sent_at?: string | null
                    viewed_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    lead_id?: string
                    venue_id?: string
                    reference_number?: string
                    event_summary?: Json
                    pricing_breakdown?: Json
                    inclusions?: Json | null
                    terms_and_policies?: string | null
                    total_estimated?: number | null
                    deposit_amount?: number | null
                    valid_until?: string | null
                    status?: string | null
                    pdf_url?: string | null
                    sent_at?: string | null
                    viewed_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            venue_public_settings: {
                Row: {
                    id: string
                    venue_id: string
                    is_visible_on_marketplace: boolean | null
                    featured: boolean | null
                    search_keywords: string[] | null
                    auto_respond_enabled: boolean | null
                    auto_respond_message: string | null
                    response_time_goal: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    is_visible_on_marketplace?: boolean | null
                    featured?: boolean | null
                    search_keywords?: string[] | null
                    auto_respond_enabled?: boolean | null
                    auto_respond_message?: string | null
                    response_time_goal?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    is_visible_on_marketplace?: boolean | null
                    featured?: boolean | null
                    search_keywords?: string[] | null
                    auto_respond_enabled?: boolean | null
                    auto_respond_message?: string | null
                    response_time_goal?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            venue_page_views: {
                Row: {
                    id: string
                    venue_id: string
                    source: string | null
                    referrer: string | null
                    user_agent: string | null
                    ip_hash: string | null
                    session_id: string | null
                    search_query_id: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    venue_id: string
                    source?: string | null
                    referrer?: string | null
                    user_agent?: string | null
                    ip_hash?: string | null
                    session_id?: string | null
                    search_query_id?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    venue_id?: string
                    source?: string | null
                    referrer?: string | null
                    user_agent?: string | null
                    ip_hash?: string | null
                    session_id?: string | null
                    search_query_id?: string | null
                    created_at?: string | null
                }
            }
            venue_search_queries: {
                Row: {
                    id: string
                    query_text: string | null
                    location: string | null
                    event_type: string | null
                    guest_count: number | null
                    event_date: string | null
                    filters: Json | null
                    results_count: number | null
                    ip_hash: string | null
                    session_id: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    query_text?: string | null
                    location?: string | null
                    event_type?: string | null
                    guest_count?: number | null
                    event_date?: string | null
                    filters?: Json | null
                    results_count?: number | null
                    ip_hash?: string | null
                    session_id?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    query_text?: string | null
                    location?: string | null
                    event_type?: string | null
                    guest_count?: number | null
                    event_date?: string | null
                    filters?: Json | null
                    results_count?: number | null
                    ip_hash?: string | null
                    session_id?: string | null
                    created_at?: string | null
                }
            }
        }
    }
}
