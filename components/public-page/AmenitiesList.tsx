"use client"

import {
  Accessibility,
  Car,
  ChefHat,
  MonitorSpeaker,
  Wifi,
  Trees,
  AirVent,
  Theater,
  Disc,
  Wine,
  Bed,
  Home,
} from "lucide-react"
import type { ComponentType } from "react"

type Amenity = {
  id: string
  amenity_key: string
  amenity_label: string
  extra_info: string | null
}

const AMENITY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  av_system: MonitorSpeaker,
  wifi: Wifi,
  parking: Car,
  catering_kitchen: ChefHat,
  accessible: Accessibility,
  climate_control: AirVent,
  outdoor_space: Trees,
  green_room: Home,
  stage: Theater,
  dance_floor: Disc,
  bar_area: Wine,
  overnight: Bed,
}

interface AmenitiesListProps {
  amenities: Amenity[]
}

export function AmenitiesList({ amenities }: AmenitiesListProps) {
  if (amenities.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Amenities</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {amenities.map((item) => {
          const Icon = AMENITY_ICONS[item.amenity_key] || Home
          return (
            <div key={item.id} className="rounded-lg border p-3">
              <p className="flex items-center gap-2 font-medium">
                <Icon className="h-4 w-4" />
                {item.amenity_label}
              </p>
              {item.extra_info && <p className="mt-1 text-sm text-muted-foreground">{item.extra_info}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
