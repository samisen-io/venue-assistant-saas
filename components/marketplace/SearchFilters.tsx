"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Users, X } from "lucide-react"

const EVENT_TYPES = [
  "Wedding",
  "Corporate",
  "Party",
  "Conference",
  "Gala",
  "Birthday",
  "Meeting",
  "Reception",
]

const VENUE_TYPES = [
  { label: "Banquet Hall", value: "banquet_hall" },
  { label: "Hotel", value: "hotel" },
  { label: "Outdoor", value: "outdoor_garden" },
  { label: "Rooftop", value: "rooftop" },
  { label: "Conference Room", value: "conference_room" },
  { label: "Ballroom", value: "ballroom" },
]

const AMENITIES = [
  "Parking",
  "WiFi",
  "AV Equipment",
  "Catering",
  "Bar",
  "Outdoor Space",
  "Wheelchair Accessible",
  "Bridal Suite",
]

export type SearchFilterValues = {
  location: string
  event_type: string[]
  venue_type: string
  guests: string
  amenities: string[]
}

type SearchFiltersProps = {
  filters: SearchFilterValues
  onChange: (filters: SearchFilterValues) => void
  onClear: () => void
}

export function SearchFilters({ filters, onChange, onClear }: SearchFiltersProps) {
  const activeCount =
    (filters.location ? 1 : 0) +
    filters.event_type.length +
    (filters.venue_type ? 1 : 0) +
    (filters.guests ? 1 : 0) +
    filters.amenities.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
            <X className="h-3 w-3 mr-1" />
            Clear All ({activeCount})
          </Button>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label>Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="City or State"
            value={filters.location}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      {/* Guest Count */}
      <div className="space-y-2">
        <Label>Minimum Guests</Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="number"
            min={1}
            placeholder="Any"
            value={filters.guests}
            onChange={(e) => onChange({ ...filters, guests: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      {/* Event Type */}
      <div className="space-y-3">
        <Label>Event Type</Label>
        <div className="space-y-2">
          {EVENT_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.event_type.includes(type.toLowerCase())}
                onCheckedChange={(checked) => {
                  const val = type.toLowerCase()
                  const next = checked
                    ? [...filters.event_type, val]
                    : filters.event_type.filter((t) => t !== val)
                  onChange({ ...filters, event_type: next })
                }}
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Venue Type */}
      <div className="space-y-3">
        <Label>Venue Type</Label>
        <div className="space-y-2">
          {VENUE_TYPES.map((type) => (
            <label key={type.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.venue_type === type.value}
                onCheckedChange={(checked) => {
                  onChange({
                    ...filters,
                    venue_type: checked ? type.value : "",
                  })
                }}
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label>Amenities</Label>
        <div className="space-y-2">
          {AMENITIES.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.amenities.includes(amenity.toLowerCase())}
                onCheckedChange={(checked) => {
                  const val = amenity.toLowerCase()
                  const next = checked
                    ? [...filters.amenities, val]
                    : filters.amenities.filter((a) => a !== val)
                  onChange({ ...filters, amenities: next })
                }}
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
