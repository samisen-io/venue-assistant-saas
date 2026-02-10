/**
 * Estimates pricing for an event based on venue packages and event details.
 * Used by the AI chat to provide approximate pricing ranges.
 */

import { createServiceRoleClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/types/database.types"

type VenuePackageRow = Database["public"]["Tables"]["venue_packages"]["Row"]
type VenuePackageAddonRow = Database["public"]["Tables"]["venue_package_addons"]["Row"]

export interface PricingEstimate {
  suggestedPackage: { name: string; basePrice: number; pricingModel: string } | null
  estimatedRange: string
  breakdown: string[]
  availableAddons: { name: string; price: number }[]
}

interface EventDetails {
  guestCount?: number
  eventType?: string
  hoursNeeded?: number
}

function calculatePackagePrice(
  pkg: VenuePackageRow,
  details: EventDetails
): number {
  const base = Number(pkg.base_price)
  const model = pkg.pricing_model ?? "flat"

  switch (model) {
    case "per_person":
      return base * (details.guestCount ?? 50)
    case "per_hour":
      return base * (details.hoursNeeded ?? 4)
    case "tiered": {
      const tiers = pkg.tiered_pricing as
        | { min_guests: number; max_guests: number; price: number }[]
        | null
      if (Array.isArray(tiers) && tiers.length > 0) {
        const count = details.guestCount ?? 50
        const tier = tiers.find(
          (t) => count >= t.min_guests && count <= t.max_guests
        )
        return tier ? tier.price : base
      }
      return base
    }
    default:
      return base
  }
}

export async function estimatePrice(
  venueId: string,
  details: EventDetails
): Promise<PricingEstimate> {
  const supabase = createServiceRoleClient()

  const [pkgRes, addonRes] = await Promise.all([
    (supabase as any)
      .from("venue_packages")
      .select("*")
      .eq("venue_id", venueId)
      .eq("is_visible_on_public_page", true)
      .order("base_price", { ascending: true }),
    (supabase as any)
      .from("venue_package_addons")
      .select("*")
      .eq("venue_id", venueId),
  ])

  const packages = (pkgRes.data ?? []) as VenuePackageRow[]
  const addons = (addonRes.data ?? []) as VenuePackageAddonRow[]

  if (packages.length === 0) {
    return {
      suggestedPackage: null,
      estimatedRange: "Contact venue for pricing",
      breakdown: [],
      availableAddons: [],
    }
  }

  // Score packages to find best fit
  const scored = packages.map((pkg) => {
    const price = calculatePackagePrice(pkg, details)
    return { pkg, price }
  })

  // Pick the middle-tier package as suggestion, or cheapest if only 1-2
  const sortedByPrice = [...scored].sort((a, b) => a.price - b.price)
  const suggested =
    sortedByPrice.length >= 3
      ? sortedByPrice[1] // middle tier
      : sortedByPrice[0]

  const lowest = sortedByPrice[0].price
  const highest = sortedByPrice[sortedByPrice.length - 1].price

  const rangeStr =
    lowest === highest
      ? `$${lowest.toLocaleString()}`
      : `$${lowest.toLocaleString()} – $${highest.toLocaleString()}`

  const breakdown: string[] = []
  breakdown.push(`Base package: $${suggested.price.toLocaleString()}`)
  if (suggested.pkg.pricing_model === "per_person" && details.guestCount) {
    breakdown.push(
      `Based on ${details.guestCount} guests at $${Number(suggested.pkg.base_price)}/person`
    )
  }

  return {
    suggestedPackage: {
      name: suggested.pkg.name,
      basePrice: suggested.price,
      pricingModel: suggested.pkg.pricing_model ?? "flat",
    },
    estimatedRange: rangeStr,
    breakdown,
    availableAddons: addons.map((a) => ({
      name: a.name,
      price: Number(a.price),
    })),
  }
}
