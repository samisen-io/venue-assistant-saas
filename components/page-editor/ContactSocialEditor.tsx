"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Database } from "@/lib/types/database.types"
import type { Json } from "@/lib/types/database.types"

type Venue = Database["public"]["Tables"]["venues"]["Row"]

export function ContactSocialEditor({
  venue,
  onChange,
}: {
  venue: Venue
  onChange: (updates: Partial<Venue>) => void
}) {
  const social = (venue.social_links || {}) as Record<string, string>
  const privacy = (venue.privacy_settings || {}) as Record<string, boolean>

  const patchSocial = (key: string, value: string) => {
    onChange({ social_links: { ...social, [key]: value } as Json })
  }

  const patchPrivacy = (key: string, value: boolean) => {
    onChange({ privacy_settings: { ...privacy, [key]: value } as Json })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact & Social</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={venue.phone || ""} onChange={(e) => onChange({ phone: e.target.value })} placeholder="Phone" />
          <Input value={venue.email || ""} onChange={(e) => onChange({ email: e.target.value })} placeholder="Email" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input value={social.facebook || ""} onChange={(e) => patchSocial("facebook", e.target.value)} placeholder="Facebook URL" />
          <Input value={social.instagram || ""} onChange={(e) => patchSocial("instagram", e.target.value)} placeholder="Instagram URL" />
          <Input value={social.linkedin || ""} onChange={(e) => patchSocial("linkedin", e.target.value)} placeholder="LinkedIn URL" />
          <Input value={social.twitter || ""} onChange={(e) => patchSocial("twitter", e.target.value)} placeholder="Twitter URL" />
          <Input value={social.youtube || ""} onChange={(e) => patchSocial("youtube", e.target.value)} placeholder="YouTube URL" />
          <Input value={social.tiktok || ""} onChange={(e) => patchSocial("tiktok", e.target.value)} placeholder="TikTok URL" />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center justify-between rounded border p-3">
            <Label>Hide address</Label>
            <Switch checked={Boolean(privacy.hide_address)} onCheckedChange={(v) => patchPrivacy("hide_address", v)} />
          </label>
          <label className="flex items-center justify-between rounded border p-3">
            <Label>Hide phone</Label>
            <Switch checked={Boolean(privacy.hide_phone)} onCheckedChange={(v) => patchPrivacy("hide_phone", v)} />
          </label>
          <label className="flex items-center justify-between rounded border p-3">
            <Label>Hide email</Label>
            <Switch checked={Boolean(privacy.hide_email)} onCheckedChange={(v) => patchPrivacy("hide_email", v)} />
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
