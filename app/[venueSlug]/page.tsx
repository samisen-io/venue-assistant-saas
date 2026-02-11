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
import { EmbeddedChat } from "@/components/public-page/EmbeddedChat"
import { ChatWidget } from "@/components/public-page/ChatWidget"
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://venuemanager.pro"
  const canonicalUrl = venue.website || `${baseUrl}/${venueSlug}`

  return {
    title,
    description,
    keywords: venue.seo_keywords || undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
      type: "website",
      url: `${baseUrl}/${venueSlug}`,
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://venuemanager.pro"

  const addressSchema = {
    "@type": "PostalAddress",
    streetAddress: venue.address,
    addressLocality: venue.city,
    addressRegion: venue.state,
    postalCode: venue.zip_code,
  }

  const geoSchema =
    venue.latitude && venue.longitude
      ? { "@type": "GeoCoordinates", latitude: venue.latitude, longitude: venue.longitude }
      : undefined

  const eventVenueSchema = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: venue.name,
    address: addressSchema,
    geo: geoSchema,
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

  // Build opening hours from business_hours if available
  const businessHours = venue.business_hours as Record<string, { open?: string; close?: string }> | null
  const dayMap: Record<string, string> = {
    mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
    fri: "Friday", sat: "Saturday", sun: "Sunday",
  }
  const openingHoursSpec = businessHours
    ? Object.entries(businessHours)
        .filter(([, v]) => v?.open && v?.close)
        .map(([day, hours]) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: dayMap[day] || day,
          opens: hours.open,
          closes: hours.close,
        }))
    : undefined

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: venue.name,
    address: addressSchema,
    geo: geoSchema,
    telephone: venue.phone,
    email: venue.email,
    url: `${baseUrl}/${venueSlug}`,
    image: venue.hero_image_url || undefined,
    description: venue.description,
    openingHoursSpecification:
      openingHoursSpec && openingHoursSpec.length > 0
        ? openingHoursSpec
        : undefined,
  }

  return (
    <main>
      <Script
        id="event-venue-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventVenueSchema) }}
      />
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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
              <EmbeddedChat slug={venueSlug} greeting={null} />

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

      <ChatWidget
        slug={venueSlug}
        venueName={venue.name}
        greeting={null}
      />
    </main>
  )
}
