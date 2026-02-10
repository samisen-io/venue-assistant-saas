"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Database } from "@/lib/types/database.types"

type Venue = Database["public"]["Tables"]["venues"]["Row"]

export function SEOEditor({
  venue,
  onChange,
}: {
  venue: Venue
  onChange: (updates: Partial<Venue>) => void
}) {
  const title = venue.seo_title || `${venue.name}${venue.city ? ` - ${venue.city}` : ""}`
  const description = venue.seo_description || venue.tagline || venue.description || ""

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO & Marketing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input value={venue.seo_title || ""} onChange={(e) => onChange({ seo_title: e.target.value.slice(0, 60) })} placeholder="SEO title (max 60)" />
        <Textarea value={venue.seo_description || ""} onChange={(e) => onChange({ seo_description: e.target.value.slice(0, 160) })} placeholder="Meta description (max 160)" />
        <Input value={venue.seo_keywords || ""} onChange={(e) => onChange({ seo_keywords: e.target.value })} placeholder="Keywords" />
        <Input value={venue.og_image_url || ""} onChange={(e) => onChange({ og_image_url: e.target.value })} placeholder="OG image URL" />
        <Input value={venue.google_analytics_id || ""} onChange={(e) => onChange({ google_analytics_id: e.target.value })} placeholder="Google Analytics ID" />
        <Input value={venue.facebook_pixel_id || ""} onChange={(e) => onChange({ facebook_pixel_id: e.target.value })} placeholder="Facebook Pixel ID" />

        <div className="rounded border p-3">
          <p className="text-xs uppercase text-muted-foreground">Google preview</p>
          <p className="mt-1 text-sm font-semibold text-blue-700">{title}</p>
          <p className="text-xs text-green-700">/{venue.slug || "your-slug"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
