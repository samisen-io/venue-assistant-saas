/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServiceRoleClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/types/database.types"

type FetchOptions = {
  slug: string
  publishedOnly?: boolean
}

type VenueRow = Database["public"]["Tables"]["venues"]["Row"]
type SpaceRow = Database["public"]["Tables"]["spaces"]["Row"]
type VenueAmenityRow = Database["public"]["Tables"]["venue_amenities"]["Row"]
type VenueEventTypeRow = Database["public"]["Tables"]["venue_event_types"]["Row"]
type VenuePackageRow = Database["public"]["Tables"]["venue_packages"]["Row"]
type VenuePackageAddonRow = Database["public"]["Tables"]["venue_package_addons"]["Row"]
type VenuePhotoRow = Database["public"]["Tables"]["venue_photos"]["Row"]
type VenueTestimonialRow = Database["public"]["Tables"]["venue_testimonials"]["Row"]
type VenueCalendarSettingsRow = Database["public"]["Tables"]["venue_calendar_settings"]["Row"]
type VenueBlackoutDateRow = Database["public"]["Tables"]["venue_blackout_dates"]["Row"]
type VenueAISettingsRow = Database["public"]["Tables"]["venue_ai_settings"]["Row"]

export async function fetchVenuePublicPageData(options: FetchOptions) {
  const supabase = createServiceRoleClient()
  const { slug, publishedOnly = true } = options

  let venueQuery = (supabase as any).from("venues").select("*").eq("slug", slug).limit(1)
  if (publishedOnly) venueQuery = venueQuery.eq("page_status", "published")

  const { data: venueRows, error: venueError } = await venueQuery
  if (venueError) throw venueError
  const venue = (venueRows?.[0] as VenueRow | undefined) ?? null

  if (!venue) return null

  const [
    spacesRes,
    amenitiesRes,
    eventTypesRes,
    packagesRes,
    addonsRes,
    photosRes,
    testimonialsRes,
    calendarSettingsRes,
    blackoutDatesRes,
    aiSettingsRes,
  ] = await Promise.all([
    (supabase as any)
      .from("spaces")
      .select("*")
      .eq("venue_id", venue.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    (supabase as any)
      .from("venue_amenities")
      .select("*")
      .eq("venue_id", venue.id)
      .order("created_at", { ascending: true }),
    (supabase as any)
      .from("venue_event_types")
      .select("*")
      .eq("venue_id", venue.id)
      .order("created_at", { ascending: true }),
    (supabase as any)
      .from("venue_packages")
      .select("*")
      .eq("venue_id", venue.id)
      .eq("is_visible_on_public_page", true)
      .order("display_order", { ascending: true }),
    (supabase as any)
      .from("venue_package_addons")
      .select("*")
      .eq("venue_id", venue.id)
      .order("created_at", { ascending: true }),
    (supabase as any)
      .from("venue_photos")
      .select("*")
      .eq("venue_id", venue.id)
      .order("display_order", { ascending: true }),
    (supabase as any)
      .from("venue_testimonials")
      .select("*")
      .eq("venue_id", venue.id)
      .eq("is_published", true)
      .order("display_order", { ascending: true }),
    (supabase as any).from("venue_calendar_settings").select("*").eq("venue_id", venue.id).limit(1),
    (supabase as any)
      .from("venue_blackout_dates")
      .select("*")
      .eq("venue_id", venue.id)
      .order("start_date", { ascending: true }),
    (supabase as any).from("venue_ai_settings").select("*").eq("venue_id", venue.id).limit(1),
  ])

  return {
    venue,
    spaces: (spacesRes.data ?? []) as SpaceRow[],
    amenities: (amenitiesRes.data ?? []) as VenueAmenityRow[],
    eventTypes: (eventTypesRes.data ?? []) as VenueEventTypeRow[],
    packages: (packagesRes.data ?? []) as VenuePackageRow[],
    packageAddons: (addonsRes.data ?? []) as VenuePackageAddonRow[],
    photos: (photosRes.data ?? []) as VenuePhotoRow[],
    testimonials: (testimonialsRes.data ?? []) as VenueTestimonialRow[],
    calendarSettings: ((calendarSettingsRes.data ?? [])[0] as VenueCalendarSettingsRow | undefined) ?? null,
    blackoutDates: (blackoutDatesRes.data ?? []) as VenueBlackoutDateRow[],
    aiSettings: ((aiSettingsRes.data ?? [])[0] as VenueAISettingsRow | undefined) ?? null,
  }
}
