import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { VenueCard, MarketplaceVenueData } from "./VenueCard"

async function getFeaturedVenues(): Promise<MarketplaceVenueData[]> {
  const supabase = createServiceRoleClient()

  // Get published venues visible on marketplace, prefer featured ones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: venues, error } = await (supabase as any)
    .from("venues")
    .select(`
      id, name, slug, city, state, venue_type, tagline, hero_image_url,
      view_count, inquiry_count,
      venue_public_settings!inner(featured, is_visible_on_marketplace),
      venue_event_types(event_type_key),
      venue_packages(base_price),
      spaces(capacity)
    `)
    .eq("page_status", "published")
    .eq("venue_public_settings.is_visible_on_marketplace", true)
    .order("view_count", { ascending: false, nullsFirst: false })
    .limit(8)

  if (error || !venues) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return venues.map((v: any) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    city: v.city,
    state: v.state,
    venue_type: v.venue_type,
    tagline: v.tagline,
    hero_image_url: v.hero_image_url,
    capacity: v.capacity,
    view_count: v.view_count,
    event_types: (v.venue_event_types || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (et: any) => et.event_type_key as string
    ),
    starting_price:
      v.venue_packages && v.venue_packages.length > 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? Math.min(...v.venue_packages.map((p: any) => p.base_price).filter(Boolean))
        : null,
  }))
}

export async function FeaturedVenues() {
  const venues = await getFeaturedVenues()

  if (venues.length === 0) return null

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Featured Venues
            </h2>
            <p className="mt-2 text-gray-500 text-lg">
              Discover top-rated venues ready to host your next event
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden md:flex">
            <Link href="/search">
              View All Venues
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" size="lg">
            <Link href="/search">
              View All Venues
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
