"use client"

import type { Database } from "@/lib/types/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type Settings = Database["public"]["Tables"]["venue_calendar_settings"]["Row"] | null

export function CalendarSettingsEditor({
  settings,
  onChange,
}: {
  settings: Settings
  onChange: (next: Settings) => void
}) {
  const current = settings || {
    id: "temp",
    venue_id: "",
    show_availability: true,
    setup_buffer_days: 0,
    teardown_buffer_days: 0,
    min_advance_booking_days: 14,
    max_advance_booking_months: 12,
    created_at: null,
    updated_at: null,
  }

  const patch = (updates: Partial<typeof current>) => onChange({ ...current, ...updates })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded border p-3">
          <Label htmlFor="show-avail">Show availability on public page</Label>
          <Switch
            id="show-avail"
            checked={Boolean(current.show_availability)}
            onCheckedChange={(v) => patch({ show_availability: v })}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            type="number"
            value={current.setup_buffer_days ?? 0}
            onChange={(e) => patch({ setup_buffer_days: Number(e.target.value) })}
            placeholder="Setup buffer days"
          />
          <Input
            type="number"
            value={current.teardown_buffer_days ?? 0}
            onChange={(e) => patch({ teardown_buffer_days: Number(e.target.value) })}
            placeholder="Teardown buffer days"
          />
          <Input
            type="number"
            value={current.min_advance_booking_days ?? 14}
            onChange={(e) => patch({ min_advance_booking_days: Number(e.target.value) })}
            placeholder="Min advance booking days"
          />
          <Input
            type="number"
            value={current.max_advance_booking_months ?? 12}
            onChange={(e) => patch({ max_advance_booking_months: Number(e.target.value) })}
            placeholder="Max advance booking months"
          />
        </div>
      </CardContent>
    </Card>
  )
}
