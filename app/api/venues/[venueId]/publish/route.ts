import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"
import type { VenuePublicPage } from "@/lib/types/public-page.types"

/* eslint-disable @typescript-eslint/no-explicit-any */

function validatePageData(pageData: VenuePublicPage): {
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  if (!pageData.venue.hero_image_url) {
    errors.push("Hero image is required")
  }

  if (pageData.photos.length < 5) {
    errors.push(`At least 5 gallery photos are required (found: ${pageData.photos.length})`)
  }

  if (pageData.spaces.length < 1) {
    errors.push("At least 1 space must be defined")
  }

  if (pageData.amenities.length === 0) {
    errors.push("Amenities must be configured")
  }

  if (!pageData.aiSettings) {
    errors.push("AI chat settings must be configured")
  }

  if (!pageData.venue.seo_description) {
    warnings.push("No SEO description provided - will use auto-generated description")
  }

  if (pageData.packages.length === 0) {
    warnings.push("No pricing packages added - visitors can still inquire via chat")
  }

  return { errors, warnings }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { supabase } = auth
    const { pageData } = (await request.json()) as { pageData: VenuePublicPage }

    if (!pageData) {
      return NextResponse.json({ error: "Missing page data" }, { status: 400 })
    }

    // Validate page data
    const { errors, warnings } = validatePageData(pageData)

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: errors, warnings },
        { status: 400 }
      )
    }

    // Create version snapshot before publishing
    const versionSnapshot = {
      venue_id: venueId,
      published_by: (await supabase.auth.getUser()).data.user?.id,
      page_data: pageData,
      published_at: new Date().toISOString(),
    }

    const versionRes = await (supabase as any)
      .from("venue_page_versions")
      .insert(versionSnapshot)
      .select("id")
      .single()

    if (versionRes.error) {
      return NextResponse.json(
        { error: "Failed to create version snapshot" },
        { status: 500 }
      )
    }

    // Update venue status to published
    const publishRes = await (supabase as any)
      .from("venues")
      .update({ page_status: "published" })
      .eq("id", venueId)
      .select()
      .single()

    if (publishRes.error) {
      return NextResponse.json(
        { error: "Failed to publish page" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Page published successfully",
      versionId: versionRes.data.id,
      warnings: warnings.length > 0 ? warnings : undefined,
    })
  } catch (error) {
    console.error("Publish error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish page" },
      { status: 500 }
    )
  }
}
