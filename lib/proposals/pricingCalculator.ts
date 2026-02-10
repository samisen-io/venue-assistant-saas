import type { Database, Json } from "@/lib/types/database.types"
import type { PricingBreakdown, PricingLineItem } from "@/lib/types/proposal.types"

type VenuePackage = Database["public"]["Tables"]["venue_packages"]["Row"]
type VenuePackageAddon = Database["public"]["Tables"]["venue_package_addons"]["Row"]

export type PricingEventDetails = {
  guestCount?: number | null
  durationHours?: number | null
  taxRate?: number | null
  depositRate?: number | null
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

function parseTieredPrice(
  tieredPricing: Json | null,
  guestCount: number
): { price: number; label: string } {
  const fallback = { price: 0, label: "Tiered pricing" }
  if (!tieredPricing) return fallback

  const source = Array.isArray(tieredPricing)
    ? tieredPricing
    : typeof tieredPricing === "object" &&
        tieredPricing !== null &&
        Array.isArray((tieredPricing as Record<string, unknown>).tiers)
      ? ((tieredPricing as Record<string, unknown>).tiers as unknown[])
      : []

  for (const rawTier of source) {
    if (!rawTier || typeof rawTier !== "object") continue
    const tier = rawTier as Record<string, unknown>
    const min = toNumber(tier.min, 0)
    const max = toNumber(tier.max, Number.MAX_SAFE_INTEGER)
    if (guestCount < min || guestCount > max) continue

    if (tier.flatPrice !== undefined) {
      return { price: toNumber(tier.flatPrice), label: `${min}-${max} guests` }
    }
    if (tier.pricePerPerson !== undefined) {
      return {
        price: toNumber(tier.pricePerPerson) * guestCount,
        label: `${min}-${max} guests`,
      }
    }
    if (tier.basePrice !== undefined) {
      return { price: toNumber(tier.basePrice), label: `${min}-${max} guests` }
    }
  }

  return fallback
}

function packageBaseLineItem(
  eventDetails: PricingEventDetails,
  pkg: VenuePackage
): PricingLineItem {
  const guestCount = toNumber(eventDetails.guestCount, 0)
  const durationHours = toNumber(eventDetails.durationHours, 1)
  const basePrice = toNumber(pkg.base_price, 0)
  const pricingModel = pkg.pricing_model ?? "flat"

  if (pricingModel === "per_person") {
    return {
      label: `${pkg.name} (${guestCount} guests)`,
      quantity: guestCount,
      unitPrice: basePrice,
      amount: roundCurrency(basePrice * guestCount),
      metadata: { pricing_model: "per_person" },
    }
  }

  if (pricingModel === "per_hour") {
    return {
      label: `${pkg.name} (${durationHours} hours)`,
      quantity: durationHours,
      unitPrice: basePrice,
      amount: roundCurrency(basePrice * durationHours),
      metadata: { pricing_model: "per_hour" },
    }
  }

  if (pricingModel === "tiered") {
    const tier = parseTieredPrice(pkg.tiered_pricing, guestCount)
    return {
      label: `${pkg.name} (${tier.label})`,
      amount: roundCurrency(tier.price || basePrice),
      metadata: { pricing_model: "tiered", tier_label: tier.label },
    }
  }

  return {
    label: pkg.name,
    amount: roundCurrency(basePrice),
    metadata: { pricing_model: "flat" },
  }
}

export function calculateTotalPrice(
  eventDetails: PricingEventDetails,
  pkg: VenuePackage,
  addons: VenuePackageAddon[] = []
): PricingBreakdown & { deposit: number } {
  const lineItems: PricingLineItem[] = [packageBaseLineItem(eventDetails, pkg)]

  for (const addon of addons) {
    lineItems.push({
      label: `Add-on: ${addon.name}`,
      amount: roundCurrency(toNumber(addon.price, 0)),
      metadata: { addon_id: addon.id },
    })
  }

  const subtotal = roundCurrency(
    lineItems.reduce((acc, item) => acc + toNumber(item.amount, 0), 0)
  )

  const taxRate = toNumber(eventDetails.taxRate, 0)
  const taxes = roundCurrency(subtotal * taxRate)
  const total = roundCurrency(subtotal + taxes)
  const depositRate = toNumber(eventDetails.depositRate, 0.3)
  const deposit = roundCurrency(total * depositRate)

  return {
    currency: "USD",
    subtotal,
    taxes,
    total,
    lineItems,
    deposit,
  }
}

