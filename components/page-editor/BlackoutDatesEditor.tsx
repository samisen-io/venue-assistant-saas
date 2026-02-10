"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Database } from "@/lib/types/database.types"

type BlackoutDate = Database["public"]["Tables"]["venue_blackout_dates"]["Row"]

export function BlackoutDatesEditor({
  blackoutDates,
  onChange,
}: {
  blackoutDates: BlackoutDate[]
  onChange: (next: BlackoutDate[]) => void
}) {
  const patch = (id: string, updates: Partial<BlackoutDate>) =>
    onChange(blackoutDates.map((b) => (b.id === id ? { ...b, ...updates } : b)))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Blackout Dates</CardTitle>
        <Button
          type="button"
          onClick={() =>
            onChange([
              ...blackoutDates,
              {
                id: `temp-${Date.now()}`,
                venue_id: blackoutDates[0]?.venue_id || "",
                start_date: "",
                end_date: "",
                reason: null,
                created_at: null,
              },
            ])
          }
        >
          Add Range
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {blackoutDates.map((date) => (
          <div key={date.id} className="grid gap-2 rounded border p-3 md:grid-cols-4">
            <Input type="date" value={date.start_date || ""} onChange={(e) => patch(date.id, { start_date: e.target.value })} />
            <Input type="date" value={date.end_date || ""} onChange={(e) => patch(date.id, { end_date: e.target.value })} />
            <Input value={date.reason || ""} onChange={(e) => patch(date.id, { reason: e.target.value })} placeholder="Reason" />
            <Button type="button" variant="destructive" onClick={() => onChange(blackoutDates.filter((b) => b.id !== date.id))}>
              Remove
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
