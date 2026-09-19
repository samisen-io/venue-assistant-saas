/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServiceRoleClient } from "@/lib/supabase/server"

/**
 * Demo / unclaimed workspaces.
 *
 * The public venue pages seeded in Feb 2026 belong to placeholder accounts
 * (profile `full_name` = "New User", no company, 555- phone numbers). They exist
 * to exercise the public-page engine — they are not real businesses. So they:
 *   - carry a visible "demo listing" banner,
 *   - are excluded from search indexing (`robots: noindex`),
 *   - are excluded from the sitemap.
 *
 * A venue counts as demo when its slug is listed in NEXT_PUBLIC_DEMO_SLUGS, or
 * when its owner profile is an unclaimed placeholder (no company name and a
 * blank / "New User" name).
 */
export const DEMO_BANNER_HEADLINE = "Demo listing — sample data"

export function demoSlugs(): string[] {
  return (process.env.NEXT_PUBLIC_DEMO_SLUGS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export function isDemoOwner(
  profile: { full_name?: string | null; company_name?: string | null } | null | undefined
): boolean {
  if (!profile) return false
  const name = (profile.full_name || "").trim().toLowerCase()
  const company = (profile.company_name || "").trim()
  return !company && (name === "" || name === "new user")
}

export async function isVenueDemo(
  venue: { slug?: string | null; owner_id?: string | null } | null | undefined
): Promise<boolean> {
  if (!venue) return false
  if (venue.slug && demoSlugs().includes(venue.slug)) return true
  if (!venue.owner_id) return false
  try {
    const supabase = createServiceRoleClient()
    const { data } = await (supabase as any)
      .from("profiles")
      .select("full_name, company_name")
      .eq("id", venue.owner_id)
      .maybeSingle()
    return isDemoOwner(data)
  } catch {
    return false
  }
}
