import type { Metadata } from "next"
import Script from "next/script"
import { notFound } from "next/navigation"
import { HeroSection } from "@/components/public-page/HeroSection"
import { PhotoGallery } from "@/components/public-page/PhotoGallery"
import { VenueSpaces } from "@/components/public-page/VenueSpaces"
import { AmenitiesList } from "@/components/public-page/AmenitiesList"
import { EventTypeBadges } from "@/components/public-page/EventTypeBadges"
import { AvailabilityCalendar } from "@/components/public-page/AvailabilityCalendar"
import { LocationContact } from "@/components/public-page/LocationContact"
import { TestimonialsCarousel } from "@/components/public-page/TestimonialsCarousel"
import { FooterCTA } from "@/components/public-page/FooterCTA"
import { fetchVenuePublicPageData } from "@/lib/public-page/fetchPublicVenue"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venueSlug: string }>
}): Promise<Metadata> {
  const { venueSlug } = await params
  const data = await fetchVenuePublicPageData({ slug: venueSlug, publishedOnly: false })
  if (!data || data.venue.page_status !== "published") {
    return { title: "Venue Not Available" }
  }

  const venue = data.venue
  const title = venue.seo_title || `${venue.name}${venue.city ? ` - ${venue.city}` : ""}`
  const description = venue.seo_description || venue.tagline || venue.description || "Event venue details"
  const image = venue.og_image_url || venue.hero_image_url || undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function PublicVenuePage({
  params,
}: {
  params: Promise<{ venueSlug: string }>
}) {
  const { venueSlug } = await params
  const data = await fetchVenuePublicPageData({ slug: venueSlug, publishedOnly: false })

  if (!data) notFound()

  const { venue } = data
  const privacySettings = (venue.privacy_settings as { hide_phone?: boolean; hide_email?: boolean; hide_address?: boolean } | null) ?? null
  if (venue.page_status !== "published") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold">This page is not currently available</h1>
        <p className="mt-3 text-muted-foreground">Please check back later or contact the venue directly.</p>
      </main>
    )
  }

  const eventVenueSchema = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: venue.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: venue.city,
      addressRegion: venue.state,
      postalCode: venue.zip_code,
    },
    geo:
      venue.latitude && venue.longitude
        ? { "@type": "GeoCoordinates", latitude: venue.latitude, longitude: venue.longitude }
        : undefined,
    telephone: venue.phone,
    description: venue.description,
    amenityFeature: data.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a.amenity_label,
      value: true,
    })),
    maximumAttendeeCapacity:
      data.spaces.length > 0
        ? Math.max(...data.spaces.map((s) => s.capacity || 0))
        : undefined,
  }

  return (
    <main>
      <Script
        id="event-venue-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventVenueSchema) }}
      />

      <HeroSection
        name={venue.name}
        city={venue.city}
        state={venue.state}
        tagline={venue.tagline}
        heroImageUrl={venue.hero_image_url}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_360px] lg:gap-10">
          <div className="space-y-12">
            <PhotoGallery photos={data.photos} />
            <VenueSpaces spaces={data.spaces} />
            <AmenitiesList amenities={data.amenities} />
            <EventTypeBadges eventTypes={data.eventTypes} />
            <AvailabilityCalendar slug={venueSlug} />
            <LocationContact
              name={venue.name}
              address={venue.address}
              city={venue.city}
              state={venue.state}
              zipCode={venue.zip_code}
              phone={venue.phone}
              email={venue.email}
              latitude={venue.latitude}
              longitude={venue.longitude}
              businessHours={venue.business_hours as Record<string, unknown> | null}
              socialLinks={venue.social_links as Record<string, string> | null}
              privacySettings={privacySettings}
            />
            <TestimonialsCarousel testimonials={data.testimonials} />
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="space-y-4">
              <section id="ai-chat" className="rounded-xl border p-6">
                <h2 className="text-2xl font-semibold">Start Planning</h2>
                <p className="mt-2 text-muted-foreground">
                  AI chat widget is coming in Phase 4. Use the contact options below to begin your inquiry.
                </p>
              </section>

              <FooterCTA
                phone={venue.phone}
                email={venue.email}
                hidePhone={privacySettings?.hide_phone === true}
                hideEmail={privacySettings?.hide_email === true}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
