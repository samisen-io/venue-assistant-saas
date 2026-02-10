import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(_request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const [packagesRes, addonsRes] = await Promise.all([
      (auth.supabase as any).from("venue_packages").select("*").eq("venue_id", venueId).order("display_order", { ascending: true }),
      (auth.supabase as any).from("venue_package_addons").select("*").eq("venue_id", venueId).order("created_at", { ascending: true }),
    ])

    return NextResponse.json({ packages: packagesRes.data ?? [], packageAddons: addonsRes.data ?? [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const entity = body.entity === "addon" ? "addon" : "package"

    if (entity === "addon") {
      const { data, error } = await (auth.supabase as any)
        .from("venue_package_addons")
        .insert({
          venue_id: venueId,
          name: body.name,
          description: body.description || null,
          price: body.price,
          available_with_packages: body.available_with_packages || null,
        })
        .select("*")
        .single()
      if (error) throw error
      return NextResponse.json(data, { status: 201 })
    }

    const { data, error } = await (auth.supabase as any)
      .from("venue_packages")
      .insert({
        venue_id: venueId,
        name: body.name,
        description: body.description || null,
        base_price: body.base_price,
        pricing_model: body.pricing_model || "flat",
        tiered_pricing: body.tiered_pricing || null,
        inclusions: body.inclusions || null,
        is_visible_on_public_page: body.is_visible_on_public_page ?? true,
        display_order: body.display_order ?? 0,
      })
      .select("*")
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const entity = body.entity === "addon" ? "addon" : "package"

    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    if (entity === "addon") {
      const { id, entity: entityField, ...fields } = body
      void entityField
      const { data, error } = await (auth.supabase as any)
        .from("venue_package_addons")
        .update(fields)
        .eq("id", id)
        .eq("venue_id", venueId)
        .select("*")
        .single()
      if (error) throw error
      return NextResponse.json(data)
    }

    const { id, entity: entityField, ...fields } = body
    void entityField
    const { data, error } = await (auth.supabase as any)
      .from("venue_packages")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("venue_id", venueId)
      .select("*")
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ venueId: string }> }) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const entity = searchParams.get("entity") === "addon" ? "addon" : "package"
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const table = entity === "addon" ? "venue_package_addons" : "venue_packages"
    const { error } = await (auth.supabase as any)
      .from(table)
      .delete()
      .eq("id", id)
      .eq("venue_id", venueId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}
