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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface PreviewPageProps {
  params: Promise<{ venueSlug: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { venueSlug } = await params
  const { token } = await searchParams

  if (!token) {
    notFound()
  }

  try {
    // Verify token is valid
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/venues/preview-verify`, {
      method: "GET",
      headers: {
        "x-preview-token": token,
        "x-venue-slug": venueSlug,
      },
    })
  } catch (error) {
    notFound()
  }

  // Load data as draft (publishedOnly: false)
  const data = await fetchVenuePublicPageData({ slug: venueSlug, publishedOnly: false })

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Banner */}
      <Alert className="rounded-none border-b-2 border-amber-200 bg-amber-50 text-amber-900">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm font-medium">
          This is a preview of your venue page. Only you can see this. Share the preview link to get feedback from others.
        </AlertDescription>
      </Alert>

      {/* Public Page Content */}
      <HeroSection
        name={data.venue.name}
        city={data.venue.city}
        state={data.venue.state}
        tagline={data.venue.tagline}
        heroImageUrl={data.venue.hero_image_url}
      />

      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_360px] lg:gap-10">
          <div className="space-y-12">
            <PhotoGallery photos={data.photos} />
            <VenueSpaces spaces={data.spaces} />
            <AmenitiesList amenities={data.amenities} />
            <EventTypeBadges eventTypes={data.eventTypes} />
            <AvailabilityCalendar slug={data.venue.slug || venueSlug} />
            <LocationContact
              name={data.venue.name}
              address={data.venue.address}
              city={data.venue.city}
              state={data.venue.state}
              zipCode={data.venue.zip_code}
              phone={data.venue.phone}
              email={data.venue.email}
              latitude={data.venue.latitude}
              longitude={data.venue.longitude}
              businessHours={data.venue.business_hours as Record<string, unknown> | null}
              socialLinks={data.venue.social_links as Record<string, string> | null}
              privacySettings={
                (data.venue.privacy_settings as
                  | { hide_phone?: boolean; hide_email?: boolean; hide_address?: boolean }
                  | null) ?? null
              }
            />
            <TestimonialsCarousel testimonials={data.testimonials} />
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="space-y-4">
              <EmbeddedChat slug={data.venue.slug || venueSlug} greeting={null} />
              <FooterCTA
                phone={data.venue.phone}
                email={data.venue.email}
                hidePhone={false}
                hideEmail={false}
              />
            </div>
          </aside>
        </div>
      </section>

      <ChatWidget slug={data.venue.slug || venueSlug} venueName={data.venue.name} greeting={null} />
    </div>
  )
}
