"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Database } from "@/lib/types/database.types"

type Venue = Database["public"]["Tables"]["venues"]["Row"]

export function BasicInfoEditor({
  venue,
  onChange,
}: {
  venue: Venue
  onChange: (updates: Partial<Venue>) => void
}) {
  const [slugAvailability, setSlugAvailability] = useState<"unknown" | "available" | "taken">("unknown")
  const [checkingSlug, setCheckingSlug] = useState(false)

  const slug = (venue.slug || "").trim().toLowerCase()

  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!slug) {
        setSlugAvailability("unknown")
        return
      }
      setCheckingSlug(true)
      try {
        const res = await fetch(`/api/venues/check-slug?slug=${encodeURIComponent(slug)}&venueId=${venue.id}`)
        const data = await res.json()
        setSlugAvailability(data.available ? "available" : "taken")
      } catch {
        setSlugAvailability("unknown")
      } finally {
        setCheckingSlug(false)
      }
    }, 350)

    return () => clearTimeout(handle)
  }, [slug, venue.id])

  const slugStatusText = useMemo(() => {
    if (!slug) return ""
    if (checkingSlug) return "Checking slug..."
    if (slugAvailability === "available") return "Slug is available"
    if (slugAvailability === "taken") return "Slug is already taken"
    return ""
  }, [slug, slugAvailability, checkingSlug])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Venue Name</Label>
            <Input value={venue.name || ""} onChange={(e) => onChange({ name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input
              maxLength={120}
              value={venue.tagline || ""}
              onChange={(e) => onChange({ tagline: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={venue.description || ""}
            onChange={(e) => onChange({ description: e.target.value.slice(0, 1000) })}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">{(venue.description || "").length}/1000</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => onChange({ slug: e.target.value.toLowerCase() })} />
            {slugStatusText && (
              <p className={`text-xs ${slugAvailability === "taken" ? "text-red-600" : "text-muted-foreground"}`}>
                {slugStatusText}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Page Status</Label>
            <Select
              value={venue.page_status || "draft"}
              onValueChange={(v) => onChange({ page_status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={venue.address || ""} onChange={(e) => onChange({ address: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={venue.city || ""} onChange={(e) => onChange({ city: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input value={venue.state || ""} onChange={(e) => onChange({ state: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>ZIP</Label>
            <Input value={venue.zip_code || ""} onChange={(e) => onChange({ zip_code: e.target.value })} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Latitude</Label>
            <Input
              type="number"
              value={venue.latitude ?? ""}
              onChange={(e) => onChange({ latitude: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div className="space-y-2">
            <Label>Longitude</Label>
            <Input
              type="number"
              value={venue.longitude ?? ""}
              onChange={(e) => onChange({ longitude: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
