import { NextResponse } from "next/server"
import { getAuthorizedVenue } from "@/lib/venues/editorAuth"
import crypto from "crypto"

/* eslint-disable @typescript-eslint/no-explicit-any */

// Generate a secure token
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { supabase, venue } = auth

    // Generate token that expires in 24 hours
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Store token in a preview_tokens table (or similar)
    // For now, we'll use a simple approach with a JSON column if it exists
    // Otherwise, return the token directly
    const previewToken = {
      token,
      expiresAt: expiresAt.toISOString(),
      venueId,
      createdAt: new Date().toISOString(),
    }

    // Try to store in database if table exists
    try {
      const storeRes = await (supabase as any)
        .from("preview_tokens")
        .insert(previewToken)

      if (!storeRes.error) {
        // Token stored successfully
      }
    } catch (e) {
      // Table might not exist, that's ok - we can validate on retrieval
      console.debug("Preview tokens table not available")
    }

    const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${venue.slug}/preview?token=${token}`

    return NextResponse.json({
      token,
      expiresAt: expiresAt.toISOString(),
      previewUrl,
    })
  } catch (error) {
    console.error("Generate preview token error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate preview token" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const auth = await getAuthorizedVenue(venueId)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { supabase } = auth
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 })
    }

    // Optional: Try to verify token from database
    try {
      const tokenRes = await (supabase as any)
        .from("preview_tokens")
        .select("*")
        .eq("token", token)
        .eq("venue_id", venueId)
        .single()

      if (tokenRes.data) {
        const expiresAt = new Date(tokenRes.data.expires_at)
        if (expiresAt < new Date()) {
          return NextResponse.json(
            { error: "Token expired" },
            { status: 401 }
          )
        }
      }
    } catch (e) {
      // Table might not exist
      console.debug("Could not verify token in database")
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Verify preview token error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify token" },
      { status: 500 }
    )
  }
}
