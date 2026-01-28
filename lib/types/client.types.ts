import { Database } from './database.types'

export type Client = Database['public']['Tables']['clients']['Row']
export type ClientCommunication = Database['public']['Tables']['client_communications']['Row']

export type ClientWithEvents = Client & {
    events?: Array<{
        id: string
        event_name: string
        event_date: string
        event_time: string | null
        event_end_time?: string | null
        status: string | null
        space_id?: string | null
        venue_id?: string
    }>
    event_count?: number
}

export type ClientFormInput = {
    venue_id?: string
    company_name?: string
    contact_name: string
    email?: string
    phone?: string
    notes?: string
    notify_on_booking_updates?: boolean
}

export type CommunicationFormInput = {
    event_id?: string | null
    message_type: 'booking_confirmed' | 'booking_updated' | 'booking_cancelled' | 'general' | 'reminder'
    subject?: string
    body?: string
}
