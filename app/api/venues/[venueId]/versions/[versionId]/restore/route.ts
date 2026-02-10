import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"
import type { VenuePublicPage } from "@/lib/types/public-page.types"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ venueId: string; versionId: string }> }
) {
  try {
    const { venueId, versionId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { supabase } = auth

    // Get the version to restore
    const versionRes = await (supabase as any)
      .from("venue_page_versions")
      .select("page_data")
      .eq("id", versionId)
      .eq("venue_id", venueId)
      .single()

    if (versionRes.error || !versionRes.data) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      )
    }

    const pageData = versionRes.data.page_data as VenuePublicPage

    // Restore all page components
    const updates: Promise<any>[] = []

    // Update venue
    if (pageData.venue) {
      updates.push(
        (supabase as any)
          .from("venues")
          .update({
            tagline: pageData.venue.tagline,
            hero_image_url: pageData.venue.hero_image_url,
            latitude: pageData.venue.latitude,
            longitude: pageData.venue.longitude,
            social_links: pageData.venue.social_links,
            privacy_settings: pageData.venue.privacy_settings,
            business_hours: pageData.venue.business_hours,
            seo_title: pageData.venue.seo_title,
            seo_description: pageData.venue.seo_description,
            seo_keywords: pageData.venue.seo_keywords,
            og_image_url: pageData.venue.og_image_url,
            google_analytics_id: pageData.venue.google_analytics_id,
            facebook_pixel_id: pageData.venue.facebook_pixel_id,
          })
          .eq("id", venueId)
      )
    }

    // Delete and restore spaces
    if (pageData.spaces.length > 0) {
      updates.push(
        (supabase as any)
          .from("spaces")
          .delete()
          .eq("venue_id", venueId)
          .then(() =>
            (supabase as any)
              .from("spaces")
              .insert(
                pageData.spaces.map((s: any) => ({
                  ...s,
                  id: undefined, // Let DB generate new IDs
                }))
              )
          )
      )
    }

    // Delete and restore amenities
    if (pageData.amenities.length >= 0) {
      updates.push(
        (supabase as any)
          .from("venue_amenities")
          .delete()
          .eq("venue_id", venueId)
          .then(() =>
            pageData.amenities.length > 0
              ? (supabase as any)
                  .from("venue_amenities")
                  .insert(pageData.amenities.map((a: any) => ({ ...a, id: undefined })))
              : Promise.resolve()
          )
      )
    }

    // Delete and restore event types
    if (pageData.eventTypes.length >= 0) {
      updates.push(
        (supabase as any)
          .from("venue_event_types")
          .delete()
          .eq("venue_id", venueId)
          .then(() =>
            pageData.eventTypes.length > 0
              ? (supabase as any)
                  .from("venue_event_types")
                  .insert(pageData.eventTypes.map((e: any) => ({ ...e, id: undefined })))
              : Promise.resolve()
          )
      )
    }

    // Delete and restore packages
    if (pageData.packages.length >= 0) {
      updates.push(
        (supabase as any)
          .from("venue_packages")
          .delete()
          .eq("venue_id", venueId)
          .then(() =>
            pageData.packages.length > 0
              ? (supabase as any)
                  .from("venue_packages")
                  .insert(pageData.packages.map((p: any) => ({ ...p, id: undefined })))
              : Promise.resolve()
          )
      )
    }

    // Delete and restore addons
    if (pageData.packageAddons.length >= 0) {
      updates.push(
        (supabase as any)
          .from("venue_package_addons")
          .delete()
          .eq("venue_id", venueId)
          .then(() =>
            pageData.packageAddons.length > 0
              ? (supabase as any)
                  .from("venue_package_addons")
                  .insert(pageData.packageAddons.map((a: any) => ({ ...a, id: undefined })))
              : Promise.resolve()
          )
      )
    }

    // Delete and restore photos
    if (pageData.photos.length >= 0) {
      updates.push(
        (supabase as any)
          .from("venue_photos")
          .delete()
          .eq("venue_id", venueId)
          .then(() =>
            pageData.photos.length > 0
              ? (supabase as any)
                  .from("venue_photos")
                  .insert(pageData.photos.map((p: any) => ({ ...p, id: undefined })))
              : Promise.resolve()
          )
      )
    }

    // Delete and restore testimonials
    if (pageData.testimonials.length >= 0) {
      updates.push(
        (supabase as any)
          .from("venue_testimonials")
          .delete()
          .eq("venue_id", venueId)
          .then(() =>
            pageData.testimonials.length > 0
              ? (supabase as any)
                  .from("venue_testimonials")
                  .insert(pageData.testimonials.map((t: any) => ({ ...t, id: undefined })))
              : Promise.resolve()
          )
      )
    }

    // Restore calendar settings
    if (pageData.calendarSettings) {
      updates.push(
        (supabase as any)
          .from("venue_calendar_settings")
          .upsert(
            { ...pageData.calendarSettings, id: undefined },
            { onConflict: "venue_id" }
          )
      )
    }

    // Delete and restore blackout dates
    if (pageData.blackoutDates.length >= 0) {
      updates.push(
        (supabase as any)
          .from("venue_blackout_dates")
          .delete()
          .eq("venue_id", venueId)
          .then(() =>
            pageData.blackoutDates.length > 0
              ? (supabase as any)
                  .from("venue_blackout_dates")
                  .insert(pageData.blackoutDates.map((b: any) => ({ ...b, id: undefined })))
              : Promise.resolve()
          )
      )
    }

    // Restore AI settings
    if (pageData.aiSettings) {
      updates.push(
        (supabase as any)
          .from("venue_ai_settings")
          .upsert(
            { ...pageData.aiSettings, id: undefined },
            { onConflict: "venue_id" }
          )
      )
    }

    // Wait for all updates
    const results = await Promise.all(updates)
    const hasErrors = results.some((r: any) => r?.error)

    if (hasErrors) {
      return NextResponse.json(
        { error: "Failed to restore version" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Version restored successfully",
    })
  } catch (error) {
    console.error("Restore version error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to restore version" },
      { status: 500 }
    )
  }
}
