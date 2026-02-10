import type { Database } from './database.types'

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationMessage = Database['public']['Tables']['conversation_messages']['Row']

export type SuggestedAction = {
  label: string
  action: string
  payload?: Record<string, unknown>
}

export type ExtractedEventData = {
  event_type?: string
  event_subtype?: string
  guest_count?: number | string
  date?: string | null
  date_flexibility?: 'exact' | 'flexible' | 'date_range'
  budget?: number | null
  requirements?: {
    catering?: boolean
    av_setup?: boolean
    overnight_rooms?: boolean
    outdoor_space?: boolean
    alcohol_service?: boolean
    custom?: string[]
  }
  contact_info?: {
    name?: string | null
    email?: string | null
    phone?: string | null
    company?: string | null
  }
  urgency?: 'high' | 'medium' | 'low'
  confidence_score?: number
}

export type ChatRequest = {
  message: string
  conversation_id?: string | null
  user_email?: string
  session_id?: string
}

export type ChatResponse = {
  conversation_id: string
  ai_response: string
  extracted_data?: ExtractedEventData
  suggested_actions?: SuggestedAction[]
  should_create_lead?: boolean
  escalate_to_human?: boolean
}
