"use client"

import { useMemo } from "react"
import type { VenuePublicPage } from "@/lib/types/public-page.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HeroSection } from "@/components/public-page/HeroSection"
import { PhotoGallery } from "@/components/public-page/PhotoGallery"
import { VenueSpaces } from "@/components/public-page/VenueSpaces"
import { AmenitiesList } from "@/components/public-page/AmenitiesList"
import { EventTypeBadges } from "@/components/public-page/EventTypeBadges"
import { PricingPackages } from "@/components/public-page/PricingPackages"

type Device = "desktop" | "tablet" | "mobile"

const WIDTHS: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
}

export function LivePreview({ data, device, onDeviceChange }: { data: VenuePublicPage; device: Device; onDeviceChange: (d: Device) => void }) {
  const width = useMemo(() => WIDTHS[device], [device])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Live Preview</CardTitle>
          <Tabs value={device} onValueChange={(v) => onDeviceChange(v as Device)}>
            <TabsList>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
              <TabsTrigger value="tablet">Tablet</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mx-auto max-w-full overflow-auto rounded-lg border bg-white" style={{ width }}>
          <HeroSection
            name={data.venue.name}
            city={data.venue.city}
            state={data.venue.state}
            tagline={data.venue.tagline}
            heroImageUrl={data.venue.hero_image_url}
          />
          <div className="space-y-8 p-4">
            <PhotoGallery photos={data.photos} />
            <VenueSpaces spaces={data.spaces} />
            <AmenitiesList amenities={data.amenities} />
            <EventTypeBadges eventTypes={data.eventTypes} />
            <PricingPackages packages={data.packages} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
