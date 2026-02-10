"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { Database } from "@/lib/types/database.types"

type VenueAmenity = Database["public"]["Tables"]["venue_amenities"]["Row"]

const PRESET = [
  ["av_system", "AV System"],
  ["wifi", "WiFi"],
  ["parking", "Parking"],
  ["catering_kitchen", "Catering Kitchen"],
  ["accessible", "Accessible"],
  ["climate_control", "Climate Control"],
  ["outdoor_space", "Outdoor Space"],
  ["green_room", "Green Room"],
  ["stage", "Stage"],
  ["dance_floor", "Dance Floor"],
  ["bar_area", "Bar Area"],
  ["overnight", "Overnight"],
]

export function AmenitiesEditor({
  amenities,
  onChange,
}: {
  amenities: VenueAmenity[]
  onChange: (next: VenueAmenity[]) => void
}) {
  const map = useMemo(() => new Map(amenities.map((a) => [a.amenity_key, a])), [amenities])

  const toggle = (key: string, label: string, enabled: boolean) => {
    if (enabled) {
      onChange([
        ...amenities,
        {
          id: `temp-${key}`,
          venue_id: amenities[0]?.venue_id || "",
          amenity_key: key,
          amenity_label: label,
          is_custom: false,
          extra_info: null,
          created_at: new Date().toISOString(),
        },
      ])
    } else {
      onChange(amenities.filter((a) => a.amenity_key !== key))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-2">
          {PRESET.map(([key, label]) => {
            const checked = map.has(key)
            return (
              <label key={key} className="flex items-center gap-2 text-sm">
                <Checkbox checked={checked} onCheckedChange={(v) => toggle(key, label, Boolean(v))} />
                {label}
              </label>
            )
          })}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Custom amenity</p>
          <Input
            placeholder="Type and press Enter"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return
              e.preventDefault()
              const value = e.currentTarget.value.trim()
              if (!value) return
              const key = value.toLowerCase().replace(/[^a-z0-9]+/g, "_")
              onChange([
                ...amenities,
                {
                  id: `temp-${key}`,
                  venue_id: amenities[0]?.venue_id || "",
                  amenity_key: key,
                  amenity_label: value,
                  is_custom: true,
                  extra_info: null,
                  created_at: new Date().toISOString(),
                },
              ])
              e.currentTarget.value = ""
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
