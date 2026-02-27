import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"
import { canUploadPhoto, getPlanLimits } from "@/lib/subscription/limits"
import type { PlanTier } from "@/lib/stripe/config"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const check = await canUploadPhoto(auth.user!.id, venueId)

    const { count } = await (auth.supabase as any)
      .from("venue_photos")
      .select("id", { count: "exact", head: true })
      .eq("venue_id", venueId)

    const { data: sub } = await (auth.supabase as any)
      .from("subscriptions")
      .select("plan_tier")
      .eq("user_id", auth.user!.id)
      .single()

    const limits = getPlanLimits((sub?.plan_tier ?? "trial") as PlanTier)
    const max = limits.maxPhotos === Infinity ? null : limits.maxPhotos

    return NextResponse.json({ allowed: check.allowed, reason: check.reason, current: count ?? 0, max })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const limit = await canUploadPhoto(auth.user!.id, venueId)
    if (!limit.allowed) return NextResponse.json({ error: limit.reason }, { status: 403 })

    const body = await request.json()
    const photos = Array.isArray(body.photos) ? body.photos : []

    if (!photos.length) {
      return NextResponse.json({ error: "No photos provided" }, { status: 400 })
    }

    const rows = photos.map((photo: any, index: number) => ({
      venue_id: venueId,
      section_name: photo.section_name || "Gallery",
      image_url: photo.image_url,
      caption: photo.caption || null,
      alt_text: photo.alt_text || null,
      display_order: Number.isFinite(photo.display_order) ? photo.display_order : index,
      is_section_thumbnail: Boolean(photo.is_section_thumbnail),
    }))

    const { data, error } = await (auth.supabase as any)
      .from("venue_photos")
      .insert(rows)
      .select("*")

    if (error) throw error
    return NextResponse.json(data ?? [], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const photos = Array.isArray(body.photos) ? body.photos : []

    for (const photo of photos) {
      if (!photo?.id) continue
      const { id, ...fields } = photo
      const { error } = await (auth.supabase as any)
        .from("venue_photos")
        .update(fields)
        .eq("id", id)
        .eq("venue_id", venueId)
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const { error } = await (auth.supabase as any)
      .from("venue_photos")
      .delete()
      .eq("id", id)
      .eq("venue_id", venueId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}
