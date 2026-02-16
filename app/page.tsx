import type { Metadata } from "next"
import { MarketplaceNav } from "@/components/marketplace/MarketplaceNav"
import { HeroSearch } from "@/components/marketplace/HeroSearch"
import { FeaturedVenues } from "@/components/marketplace/FeaturedVenues"
import { CategoryBrowser } from "@/components/marketplace/CategoryBrowser"
import { HowItWorks } from "@/components/marketplace/HowItWorks"
import { SocialProof } from "@/components/marketplace/SocialProof"
import { VenueManagerCTA } from "@/components/marketplace/VenueManagerCTA"
import { MarketplaceFooter } from "@/components/marketplace/MarketplaceFooter"

export const metadata: Metadata = {
  title: "Find Your Perfect Event Venue | VenueManager",
  description:
    "Discover and book amazing venues for weddings, corporate events, parties, and more. Browse hundreds of venues and connect directly with venue managers.",
  openGraph: {
    title: "Find Your Perfect Event Venue | VenueManager",
    description:
      "Discover and book amazing venues for weddings, corporate events, parties, and more.",
  },
}

export default function MarketplaceHome() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketplaceNav />
      <main className="flex-1">
        <HeroSearch />
        <FeaturedVenues />
        <CategoryBrowser />
        <HowItWorks />
        <SocialProof />
        <VenueManagerCTA />
      </main>
      <MarketplaceFooter />
    </div>
  )
}
