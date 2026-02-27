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

    // Verify token against preview_tokens table
    const tokenRes = await (supabase as any)
      .from("preview_tokens")
      .select("expires_at")
      .eq("token", token)
      .eq("venue_id", venueId)
      .single()

    if (tokenRes.error) {
      // code 42P01 = relation does not exist (table not migrated yet)
      if (tokenRes.error.code === "42P01") {
        console.debug("preview_tokens table not found — run migrations/setup-preview-tokens.sql")
        return NextResponse.json({ valid: true })
      }
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const expiresAt = new Date(tokenRes.data.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
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
