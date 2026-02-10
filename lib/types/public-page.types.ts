import type { Database, Json } from './database.types'

export type VenuePhoto = Database['public']['Tables']['venue_photos']['Row']
export type VenueAmenity = Database['public']['Tables']['venue_amenities']['Row']
export type VenueEventType = Database['public']['Tables']['venue_event_types']['Row']
export type VenuePackage = Database['public']['Tables']['venue_packages']['Row']
export type VenuePackageAddon = Database['public']['Tables']['venue_package_addons']['Row']
export type VenueTestimonial = Database['public']['Tables']['venue_testimonials']['Row']
export type VenueAvailability = Database['public']['Tables']['venue_availability']['Row']
export type CalendarSettings = Database['public']['Tables']['venue_calendar_settings']['Row']
export type BlackoutDate = Database['public']['Tables']['venue_blackout_dates']['Row']
export type VenueAISettings = Database['public']['Tables']['venue_ai_settings']['Row']
export type PageAnalyticsEvent = Database['public']['Tables']['page_analytics']['Row']

export type VenuePublicPage = {
  venue: Database['public']['Tables']['venues']['Row']
  spaces: Database['public']['Tables']['spaces']['Row'][]
  amenities: VenueAmenity[]
  eventTypes: VenueEventType[]
  packages: VenuePackage[]
  packageAddons: VenuePackageAddon[]
  photos: VenuePhoto[]
  testimonials: VenueTestimonial[]
  availability: VenueAvailability[]
  calendarSettings: CalendarSettings | null
  blackoutDates: BlackoutDate[]
  aiSettings: VenueAISettings | null
}

export type SocialLinks = {
  facebook?: string
  instagram?: string
  linkedin?: string
  twitter?: string
  youtube?: string
  tiktok?: string
}

export type PrivacySettings = {
  hide_address?: boolean
  hide_phone?: boolean
  hide_email?: boolean
}

export type BusinessHours = Record<string, Json>
