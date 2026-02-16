import type { Metadata } from "next"
import { Suspense } from "react"
import { MarketplaceNav } from "@/components/marketplace/MarketplaceNav"
import { MarketplaceFooter } from "@/components/marketplace/MarketplaceFooter"
import { SearchResults } from "@/components/marketplace/SearchResults"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Search Event Venues | VenueManager",
  description:
    "Search and compare event venues by location, event type, guest count, and amenities. Find the perfect venue for your wedding, corporate event, party, or conference.",
}

function SearchSkeleton() {
  return (
    <div className="space-y-8">
      {/* Search bar skeleton */}
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </aside>
        <div className="flex-1 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VenuesSearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketplaceNav />
      <main className="flex-1 container px-4 md:px-6 py-8">
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults />
        </Suspense>
      </main>
      <MarketplaceFooter />
    </div>
  )
}
