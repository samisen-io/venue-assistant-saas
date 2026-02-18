/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js"

interface ResolveVenueSuccess {
  venue: { id: string; name: string; owner_id: string }
  error: null
  status: 200
}
interface ResolveVenueError {
  venue: null
  error: string
  status: 400 | 404
}
type ResolveVenueResult = ResolveVenueSuccess | ResolveVenueError

/**
 * Resolves the active venue from the X-Venue-Id request header.
 * RLS automatically ensures the authenticated user can only access venues they own.
 */
export async function resolveVenue(
  request: Request,
  supabase: SupabaseClient
): Promise<ResolveVenueResult> {
  const venueId = request.headers.get("X-Venue-Id")
  if (!venueId) {
    return { venue: null, error: "No venue selected", status: 400 }
  }

  const { data: venue, error } = await (supabase as any)
    .from("venues")
    .select("id, name, owner_id")
    .eq("id", venueId)
    .single()

  if (error || !venue) {
    return { venue: null, error: "Venue not found", status: 404 }
  }

  return { venue, error: null, status: 200 }
}

/**
 * Falls back to the user's first/default venue when no header is provided.
 * Use this for backward compatibility where venueId wasn't always passed.
 */
export async function resolveVenueWithFallback(
  request: Request,
  supabase: SupabaseClient,
  userId: string
): Promise<ResolveVenueResult> {
  const venueId = request.headers.get("X-Venue-Id")

  if (venueId) {
    const { data: venue, error } = await (supabase as any)
      .from("venues")
      .select("id, name, owner_id")
      .eq("id", venueId)
      .single()

    if (!error && venue) {
      return { venue, error: null, status: 200 }
    }
  }

  // Fallback: get default or first venue for this user
  const { data: venue, error } = await (supabase as any)
    .from("venues")
    .select("id, name, owner_id")
    .eq("owner_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  if (error || !venue) {
    return { venue: null, error: "No venue found", status: 404 }
  }

  return { venue, error: null, status: 200 }
}
