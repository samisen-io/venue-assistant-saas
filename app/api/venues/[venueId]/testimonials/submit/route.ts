import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const body = await request.json()

    if (!body.client_name || !body.quote) {
      return NextResponse.json({ error: "client_name and quote are required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await (supabase as any)
      .from("venue_testimonials")
      .insert({
        venue_id: venueId,
        client_name: body.client_name,
        client_company: body.client_company || null,
        event_type: body.event_type || null,
        quote: body.quote,
        star_rating: body.star_rating ?? null,
        client_photo_url: body.client_photo_url || null,
        event_date: body.event_date || null,
        is_published: false,
        source: "submission_form",
      })
      .select("id")
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, id: data?.id }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}
