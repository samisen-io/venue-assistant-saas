import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(request.url)
    const slug = (searchParams.get("slug") || "").trim().toLowerCase()
    const venueId = searchParams.get("venueId")

    if (!slug) return NextResponse.json({ available: false, reason: "Missing slug" }, { status: 400 })

    let query = (supabase as any).from("venues").select("id").eq("slug", slug).limit(1)
    if (venueId) query = query.neq("id", venueId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ available: !data || data.length === 0 })
  } catch (error: any) {
    return NextResponse.json({ available: false, error: error.message || "Internal Error" }, { status: 500 })
  }
}
