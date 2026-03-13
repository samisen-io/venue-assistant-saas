import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name is required'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

// Venue schema (one per user - property-level details)
export const venueFormSchema = z.object({
    name: z.string().min(2, 'Venue name must be at least 2 characters').max(100, 'Venue name must be less than 100 characters'),
    address: z.string().min(1, 'Address is required').max(200, 'Address must be less than 200 characters'),
    city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
    state: z.string().min(1, 'State is required').max(50, 'State must be less than 50 characters'),
    zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format (e.g., 12345 or 12345-6789)'),
    contact_name: z.string().min(2, 'Contact name is required').max(100, 'Contact name must be less than 100 characters'),
    phone: z.string().regex(/^[\d\s\-\(\)]+$/, 'Invalid phone number format').min(10, 'Phone number required'),
    email: z.string().email('Invalid email address'),
    venue_type: z.string().min(1, 'Please select a venue type'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
})

// Space schema (multiple per venue - bookable spaces)
export const spaceFormSchema = z.object({
    name: z.string().min(2, 'Space name must be at least 2 characters').max(100, 'Space name must be less than 100 characters'),
    capacity: z.coerce.number().min(1, 'Capacity must be at least 1').max(10000, 'Capacity seems too large'),
    space_type: z.string().min(1, 'Please select a space type'),
    floor_level: z.string().max(50, 'Floor level must be less than 50 characters').optional(),
    square_footage: z.coerce.number().min(0, 'Square footage cannot be negative').max(1000000, 'Square footage seems too large').optional(),
    hourly_rate: z.coerce.number().min(0, 'Hourly rate cannot be negative').max(100000, 'Hourly rate seems too large').optional(),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
})

export const vendorFormSchema = z.object({
    name: z.string().min(2, 'Vendor name must be at least 2 characters').max(100, 'Vendor name must be less than 100 characters'),
    event_service_ids: z.array(z.string()).min(1, 'Please select at least one service'),
    contact_name: z.string().max(100, 'Contact name must be less than 100 characters').optional(),
    contact_email: z.string().email('Please enter a valid email address'),
    contact_phone: z.string().regex(/^[\d\s\-\(\)]+$/, 'Invalid phone number format').optional().or(z.literal('')),
    cost_structure: z.string().optional(),
    cost_per_unit: z.coerce.number().min(0, 'Cost cannot be negative').max(1000000, 'Cost seems too large').optional(),
    website: z.string().url('Please enter a valid URL (e.g., https://example.com)').optional().or(z.literal('')),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
})

export const eventFormSchema = z.object({
    event_name: z.string().min(2, 'Event name must be at least 2 characters').max(100, 'Event name must be less than 100 characters'),
    event_type: z.string().min(1, 'Please select an event type'),
    event_date: z.string().refine((date) => new Date(date) > new Date(), {
        message: 'Event date must be in the future',
    }),
    event_time: z.string().optional(),
    event_end_time: z.string().optional(),
    guest_count: z.coerce.number().min(1, 'Guest count must be at least 1').max(100000, 'Guest count seems too large'),
    budget_total: z.coerce.number().min(1, 'Budget must be greater than $0').max(10000000, 'Budget seems too large'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    special_requirements: z.string().max(500, 'Special requirements must be less than 500 characters').optional(),
    client_id: z.string().uuid().nullable().optional(),
})

export const reviewFormSchema = z.object({
    on_time: z.boolean(),
    quality_rating: z.coerce.number().min(1).max(5),
    cost_accurate: z.boolean(),
    would_use_again: z.boolean(),
    notes: z.string().optional(),
})

export const clientFormSchema = z.object({
    company_name: z.string().max(100, 'Company name must be less than 100 characters').optional().or(z.literal('')),
    contact_name: z.string().min(2, 'Contact name is required').max(100, 'Contact name must be less than 100 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().regex(/^[\\d\\s\\-\\(\\)]+$/, 'Invalid phone number format').optional().or(z.literal('')),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().or(z.literal('')),
    notify_on_booking_updates: z.boolean().optional(),
})

export const clientCommunicationSchema = z.object({
    event_id: z.string().uuid().nullable().optional(),
    message_type: z.enum(['booking_confirmed', 'booking_updated', 'booking_cancelled', 'general', 'reminder']),
    subject: z.string().max(200, 'Subject must be less than 200 characters').optional().or(z.literal('')),
    body: z.string().min(1, 'Message body is required').max(5000, 'Message body must be less than 5000 characters'),
})
