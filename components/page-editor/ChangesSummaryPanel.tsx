"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { VenuePublicPage } from "@/lib/types/public-page.types"

function changed(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) !== JSON.stringify(b)
}

export function ChangesSummaryPanel({
  baseline,
  current,
}: {
  baseline: VenuePublicPage | null
  current: VenuePublicPage
}) {
  if (!baseline) return null

  const rows = [
    ["Basic info", changed(baseline.venue, current.venue)],
    ["Spaces", changed(baseline.spaces, current.spaces)],
    ["Amenities", changed(baseline.amenities, current.amenities)],
    ["Event types", changed(baseline.eventTypes, current.eventTypes)],
    ["Photos", changed(baseline.photos, current.photos)],
    ["Packages", changed(baseline.packages, current.packages)],
    ["Add-ons", changed(baseline.packageAddons, current.packageAddons)],
    ["Calendar", changed(baseline.calendarSettings, current.calendarSettings)],
    ["Blackout dates", changed(baseline.blackoutDates, current.blackoutDates)],
    ["AI settings", changed(baseline.aiSettings, current.aiSettings)],
    ["Testimonials", changed(baseline.testimonials, current.testimonials)],
  ] as const

  const changedCount = rows.filter((r) => r[1]).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Changes Since Last Load ({changedCount})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {rows.map(([label, isChanged]) => (
          <p key={label} className={isChanged ? "text-foreground" : "text-muted-foreground"}>
            {isChanged ? "• " : "○ "}
            {label}
          </p>
        ))}
      </CardContent>
    </Card>
  )
}

