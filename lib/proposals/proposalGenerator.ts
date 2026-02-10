import type { Database, Json } from "@/lib/types/database.types"
import { calculateTotalPrice, type PricingEventDetails } from "./pricingCalculator"

type Lead = Database["public"]["Tables"]["leads"]["Row"]
type Venue = Database["public"]["Tables"]["venues"]["Row"]
type VenuePackage = Database["public"]["Tables"]["venue_packages"]["Row"]
type VenuePackageAddon = Database["public"]["Tables"]["venue_package_addons"]["Row"]

export type GenerateProposalInput = {
  lead: Lead
  venue: Venue
  packages: VenuePackage[]
  addons?: VenuePackageAddon[]
  selectedPackageId?: string
  selectedAddonIds?: string[]
  eventDetails?: PricingEventDetails
  validDays?: number
  termsAndPolicies?: string | null
}

export type GeneratedProposalDraft = {
  referenceNumber: string
  eventSummary: Json
  pricingBreakdown: Json
  inclusions: Json | null
  totalEstimated: number
  depositAmount: number
  validUntil: string
  termsAndPolicies: string | null
  selectedPackage: VenuePackage
  selectedAddons: VenuePackageAddon[]
}

function yearNow(): number {
  return new Date().getFullYear()
}

export function generateReferenceNumber(): string {
  const year = yearNow()
  const sequence = String(Date.now() % 10000).padStart(4, "0")
  return `INQ-${year}-${sequence}`
}

function pickPackage(
  lead: Lead,
  packages: VenuePackage[],
  selectedPackageId?: string
): VenuePackage {
  if (!packages.length) {
    throw new Error("No venue packages configured for this venue")
  }

  if (selectedPackageId) {
    const explicit = packages.find((pkg) => pkg.id === selectedPackageId)
    if (explicit) return explicit
  }

  const guestCount = lead.guest_count ?? 0
  const sorted = [...packages].sort((a, b) => (a.base_price ?? 0) - (b.base_price ?? 0))
  if (sorted.length === 1) return sorted[0]

  if (guestCount <= 60) return sorted[0]
  if (guestCount <= 150) return sorted[Math.min(1, sorted.length - 1)]
  return sorted[sorted.length - 1]
}

function buildEventSummary(lead: Lead, venue: Venue): Json {
  return {
    lead_id: lead.id,
    venue_id: venue.id,
    venue_name: venue.name,
    contact_name: lead.contact_name,
    contact_email: lead.contact_email,
    event_type: lead.event_type,
    event_date: lead.event_date,
    guest_count: lead.guest_count,
    requirements: lead.requirements,
    estimated_budget: lead.estimated_budget,
  }
}

export function generateProposal(input: GenerateProposalInput): GeneratedProposalDraft {
  const selectedPackage = pickPackage(input.lead, input.packages, input.selectedPackageId)
  const selectedAddons = (input.addons ?? []).filter((addon) =>
    input.selectedAddonIds?.includes(addon.id)
  )

  const eventDetails: PricingEventDetails = {
    guestCount: input.lead.guest_count ?? undefined,
    ...input.eventDetails,
  }

  const pricing = calculateTotalPrice(eventDetails, selectedPackage, selectedAddons)
  const validDays = input.validDays ?? 30
  const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  return {
    referenceNumber: generateReferenceNumber(),
    eventSummary: buildEventSummary(input.lead, input.venue),
    pricingBreakdown: pricing as Json,
    inclusions: selectedPackage.inclusions,
    totalEstimated: pricing.total,
    depositAmount: pricing.deposit,
    validUntil,
    termsAndPolicies:
      input.termsAndPolicies ??
      "Pricing and availability are subject to final booking confirmation. A signed agreement and deposit are required to secure your date.",
    selectedPackage,
    selectedAddons,
  }
}

