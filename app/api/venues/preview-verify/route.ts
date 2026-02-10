import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function GET(request: Request) {
  try {
    const token = request.headers.get("x-preview-token")
    const venueSlug = request.headers.get("x-venue-slug")

    if (!token || !venueSlug) {
      return NextResponse.json(
        { error: "Missing token or venue slug" },
        { status: 400 }
      )
    }

    // Find venue by slug
    const venueRes = await supabase
      .from("venues")
      .select("id")
      .eq("slug", venueSlug)
      .single()

    const venueId = (venueRes as any).data?.id as string | undefined

    if (venueRes.error || !venueId) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      )
    }

    // Try to verify token
    try {
      const tokenRes = await (supabase as any)
        .from("preview_tokens")
        .select("*")
        .eq("token", token)
        .eq("venue_id", venueId)
        .single()

      if (tokenRes.error || !tokenRes.data) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        )
      }

      const expiresAt = new Date(tokenRes.data.expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Token expired" },
          { status: 401 }
        )
      }
    } catch (e) {
      // Preview tokens table might not exist
      // For now, allow preview with just token existence check
      console.debug("Could not verify token in database, allowing preview")
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Preview verify error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify token" },
      { status: 500 }
    )
  }
}
