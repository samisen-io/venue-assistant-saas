"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Breadcrumbs } from "@/components/shared/Breadcrumbs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Megaphone, Eye, MessageSquare, X } from "lucide-react"
import { MarketplaceAnalytics } from "@/components/marketplace/MarketplaceAnalytics"
import { Separator } from "@/components/ui/separator"

type MarketplaceSettings = {
  venue_id: string
  is_visible_on_marketplace: boolean
  featured: boolean
  search_keywords: string[]
  auto_respond_enabled: boolean
  auto_respond_message: string | null
  response_time_goal: string
}

export default function MarketplaceSettingsPage() {
  const params = useParams()
  const venueId = params.venueId as string
  const { toast } = useToast()

  const [settings, setSettings] = useState<MarketplaceSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newKeyword, setNewKeyword] = useState("")

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/venues/${venueId}/marketplace`)
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [venueId])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch(`/api/venues/${venueId}/marketplace`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        toast({ title: "Settings saved", description: "Your marketplace listing has been updated." })
      } else {
        throw new Error("Failed to save")
      }
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  function addKeyword() {
    if (!settings || !newKeyword.trim()) return
    if (settings.search_keywords.includes(newKeyword.trim().toLowerCase())) return
    setSettings({
      ...settings,
      search_keywords: [...settings.search_keywords, newKeyword.trim().toLowerCase()],
    })
    setNewKeyword("")
  }

  function removeKeyword(keyword: string) {
    if (!settings) return
    setSettings({
      ...settings,
      search_keywords: settings.search_keywords.filter((k) => k !== keyword),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Unable to load marketplace settings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Marketplace Listing" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Marketplace Listing
          </h1>
          <p className="text-gray-500 mt-1">
            Manage how your venue appears on the public marketplace.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Marketplace Visibility
              </CardTitle>
              <CardDescription>
                Control whether your venue appears in marketplace search results.
              </CardDescription>
            </div>
            <Switch
              checked={settings.is_visible_on_marketplace}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, is_visible_on_marketplace: checked })
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {settings.is_visible_on_marketplace ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Your venue is visible on the marketplace
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Your venue is hidden from marketplace search. Toggle this on to start receiving inquiries from event planners.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Search Keywords</CardTitle>
          <CardDescription>
            Add keywords to help event planners find your venue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., outdoor wedding, corporate retreat"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addKeyword()
                }
              }}
            />
            <Button variant="outline" onClick={addKeyword}>
              Add
            </Button>
          </div>
          {settings.search_keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {settings.search_keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="gap-1">
                  {keyword}
                  <button onClick={() => removeKeyword(keyword)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Respond */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Auto-Respond
              </CardTitle>
              <CardDescription>
                Automatically send a reply when you receive a marketplace inquiry.
              </CardDescription>
            </div>
            <Switch
              checked={settings.auto_respond_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_respond_enabled: checked })
              }
            />
          </div>
        </CardHeader>
        {settings.auto_respond_enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Auto-Reply Message</Label>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
                placeholder="Thank you for your interest in our venue! We've received your inquiry and will get back to you shortly."
                value={settings.auto_respond_message || ""}
                onChange={(e) =>
                  setSettings({ ...settings, auto_respond_message: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Response Time Goal</Label>
              <Select
                value={settings.response_time_goal}
                onValueChange={(value) =>
                  setSettings({ ...settings, response_time_goal: value })
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Within 1 hour</SelectItem>
                  <SelectItem value="4h">Within 4 hours</SelectItem>
                  <SelectItem value="12h">Within 12 hours</SelectItem>
                  <SelectItem value="24h">Within 24 hours</SelectItem>
                  <SelectItem value="48h">Within 48 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Analytics */}
      <Separator />
      <MarketplaceAnalytics venueId={venueId} />
    </div>
  )
}
