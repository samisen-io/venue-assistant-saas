"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { Database } from "@/lib/types/database.types"

type VenueEventType = Database["public"]["Tables"]["venue_event_types"]["Row"]

const PRESET = [
  ["wedding", "Wedding"],
  ["corporate", "Corporate"],
  ["birthday", "Birthday"],
  ["conference", "Conference"],
  ["gala", "Gala"],
  ["social", "Social"],
]

export function EventTypesEditor({
  eventTypes,
  onChange,
}: {
  eventTypes: VenueEventType[]
  onChange: (next: VenueEventType[]) => void
}) {
  const map = useMemo(() => new Map(eventTypes.map((t) => [t.event_type_key, t])), [eventTypes])

  const toggle = (key: string, label: string, enabled: boolean) => {
    if (enabled) {
      onChange([
        ...eventTypes,
        {
          id: `temp-${key}`,
          venue_id: eventTypes[0]?.venue_id || "",
          event_type_key: key,
          event_type_label: label,
          is_custom: false,
          created_at: new Date().toISOString(),
        },
      ])
    } else {
      onChange(eventTypes.filter((t) => t.event_type_key !== key))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-2">
          {PRESET.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox checked={map.has(key)} onCheckedChange={(v) => toggle(key, label, Boolean(v))} />
              {label}
            </label>
          ))}
        </div>

        <Input
          placeholder="Custom event type (Enter)"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return
            e.preventDefault()
            const value = e.currentTarget.value.trim()
            if (!value) return
            const key = value.toLowerCase().replace(/[^a-z0-9]+/g, "_")
            onChange([
              ...eventTypes,
              {
                id: `temp-${key}`,
                venue_id: eventTypes[0]?.venue_id || "",
                event_type_key: key,
                event_type_label: value,
                is_custom: true,
                created_at: new Date().toISOString(),
              },
            ])
            e.currentTarget.value = ""
          }}
        />
      </CardContent>
    </Card>
  )
}
