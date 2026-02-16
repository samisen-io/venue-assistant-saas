import { MarketplaceNav } from "@/components/marketplace/MarketplaceNav"
import { MarketplaceFooter } from "@/components/marketplace/MarketplaceFooter"

export default function PublicVenueLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MarketplaceNav />
      <div className="flex-1">{children}</div>
      <MarketplaceFooter />
    </div>
  )
}
