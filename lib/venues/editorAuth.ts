import { createClient } from "@/lib/supabase/server"

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function getAuthorizedVenue(venueId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized", status: 401 as const, supabase, user: null, venue: null }
  }

  const { data: venue, error } = await (supabase as any)
    .from("venues")
    .select("*")
    .eq("id", venueId)
    .eq("owner_id", user.id)
    .single()

  if (error || !venue) {
    return { error: "Venue not found", status: 404 as const, supabase, user, venue: null }
  }

  return { error: null, status: 200 as const, supabase, user, venue }
}
