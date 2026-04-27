
import { MarketplaceNav } from "@/components/marketplace/MarketplaceNav"
import { MarketplaceFooter } from "@/components/marketplace/MarketplaceFooter"
import { CookieConsent } from "@/components/shared/CookieConsent"

export default function PublicVenueLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <CookieConsent />
      <MarketplaceNav />
      <div className="flex-1">{children}</div>
      <MarketplaceFooter />
    </div>
  )
}
