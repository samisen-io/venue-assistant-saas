"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/shared/Breadcrumbs"
import { Loading } from "@/components/shared/Loading"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { useToast } from "@/hooks/use-toast"
import type { VenuePublicPage } from "@/lib/types/public-page.types"
import type { Database } from "@/lib/types/database.types"
import { BasicInfoEditor } from "@/components/page-editor/BasicInfoEditor"
import { PhotosMediaEditor } from "@/components/page-editor/PhotosMediaEditor"
import { SpacesEditor } from "@/components/page-editor/SpacesEditor"
import { AmenitiesEditor } from "@/components/page-editor/AmenitiesEditor"
import { EventTypesEditor } from "@/components/page-editor/EventTypesEditor"
import { AboutEditor } from "@/components/page-editor/AboutEditor"
import { CalendarSettingsEditor } from "@/components/page-editor/CalendarSettingsEditor"
import { BlackoutDatesEditor } from "@/components/page-editor/BlackoutDatesEditor"
import { PackagesEditor } from "@/components/page-editor/PackagesEditor"
import { AddonsEditor } from "@/components/page-editor/AddonsEditor"
import { PricingSettingsEditor } from "@/components/page-editor/PricingSettingsEditor"
import { AIChatSettingsEditor } from "@/components/page-editor/AIChatSettingsEditor"
import { ContactSocialEditor } from "@/components/page-editor/ContactSocialEditor"
import { SEOEditor } from "@/components/page-editor/SEOEditor"
import { TestimonialsEditor } from "@/components/page-editor/TestimonialsEditor"
import { LivePreview } from "@/components/page-editor/LivePreview"
import { ChangesSummaryPanel } from "@/components/page-editor/ChangesSummaryPanel"
import { PublishButton } from "@/components/page-editor/PublishButton"
import { VersionHistory } from "@/components/page-editor/VersionHistory"
import { UnpublishDialog } from "@/components/page-editor/UnpublishDialog"
import { PreviewLinkButton } from "@/components/page-editor/PreviewLinkButton"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Monitor, ListChecks } from "lucide-react"

type VenuePackage = Database["public"]["Tables"]["venue_packages"]["Row"]
type VenuePackageAddon = Database["public"]["Tables"]["venue_package_addons"]["Row"]
type VenueTestimonial = Database["public"]["Tables"]["venue_testimonials"]["Row"]

async function parseJson<T>(res: Response): Promise<T> {
  const payload = await res.json()
  if (!res.ok) {
    throw new Error((payload as { error?: string })?.error || "Request failed")
  }
  return payload as T
}

export default function VenuePublicPageEditorPage() {
  const params = useParams()
  const venueId = params?.venueId as string
  const { toast } = useToast()

  const [data, setData] = useState<VenuePublicPage | null>(null)
  const [previewData, setPreviewData] = useState<VenuePublicPage | null>(null)
  const [baselineData, setBaselineData] = useState<VenuePublicPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [dirty, setDirty] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const isSavingRef = useRef(false)
  const historyRef = useRef<VenuePublicPage[]>([])

  // Panel visibility state
  const [previewPanelOpen, setPreviewPanelOpen] = useState(false)
  const [changesPanelOpen, setChangesPanelOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/venues/${venueId}/public-page`)
      const payload = await parseJson<VenuePublicPage>(res)
      setData(payload)
      setPreviewData(payload)
      setBaselineData(payload)
      historyRef.current = []
      setDirty(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [venueId])

  const syncPackagesAndAddons = useCallback(
    async (packages: VenuePackage[], addons: VenuePackageAddon[]) => {
      const res = await fetch(`/api/venues/${venueId}/packages`)
      const current = await parseJson<{ packages: VenuePackage[]; packageAddons: VenuePackageAddon[] }>(res)

      const desiredPackageIds = new Set(packages.filter((p) => !p.id.startsWith("temp-")).map((p) => p.id))
      const desiredAddonIds = new Set(addons.filter((a) => !a.id.startsWith("temp-")).map((a) => a.id))

      for (const existing of current.packages) {
        if (!desiredPackageIds.has(existing.id)) {
          await parseJson(
            await fetch(`/api/venues/${venueId}/packages?id=${existing.id}&entity=package`, { method: "DELETE" })
          )
        }
      }

      for (const existing of current.packageAddons) {
        if (!desiredAddonIds.has(existing.id)) {
          await parseJson(
            await fetch(`/api/venues/${venueId}/packages?id=${existing.id}&entity=addon`, { method: "DELETE" })
          )
        }
      }

      for (const item of packages) {
        if (item.id.startsWith("temp-")) {
          const { id: _id, created_at: _created, updated_at: _updated, ...body } = item
          await parseJson(
            await fetch(`/api/venues/${venueId}/packages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ entity: "package", ...body }),
            })
          )
          void _id
          void _created
          void _updated
          continue
        }

        await parseJson(
          await fetch(`/api/venues/${venueId}/packages`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entity: "package", ...item }),
          })
        )
      }

      for (const item of addons) {
        if (item.id.startsWith("temp-")) {
          const { id: _id, created_at: _created, ...body } = item
          await parseJson(
            await fetch(`/api/venues/${venueId}/packages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ entity: "addon", ...body }),
            })
          )
          void _id
          void _created
          continue
        }

        await parseJson(
          await fetch(`/api/venues/${venueId}/packages`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entity: "addon", ...item }),
          })
        )
      }
    },
    [venueId]
  )

  const syncTestimonials = useCallback(
    async (testimonials: VenueTestimonial[]) => {
      const res = await fetch(`/api/venues/${venueId}/testimonials`)
      const current = await parseJson<VenueTestimonial[]>(res)
      const desiredIds = new Set(testimonials.filter((t) => !t.id.startsWith("temp-")).map((t) => t.id))

      for (const existing of current) {
        if (!desiredIds.has(existing.id)) {
          await parseJson(
            await fetch(`/api/venues/${venueId}/testimonials?id=${existing.id}`, { method: "DELETE" })
          )
        }
      }

      for (const t of testimonials) {
        if (t.id.startsWith("temp-")) {
          const { id: _id, created_at: _created, ...body } = t
          await parseJson(
            await fetch(`/api/venues/${venueId}/testimonials`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
          )
          void _id
          void _created
          continue
        }

        await parseJson(
          await fetch(`/api/venues/${venueId}/testimonials`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(t),
          })
        )
      }
    },
    [venueId]
  )

  const saveAll = useCallback(async () => {
    if (!data || isSavingRef.current) return

    setSaving(true)
    isSavingRef.current = true
    try {
      await parseJson(
        await fetch(`/api/venues/${venueId}/public-page`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venue: data.venue, spaces: data.spaces }),
        })
      )

      await Promise.all([
        parseJson(
          await fetch(`/api/venues/${venueId}/amenities`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amenities: data.amenities.map((a) => ({
                amenity_key: a.amenity_key,
                amenity_label: a.amenity_label,
                is_custom: a.is_custom,
                extra_info: a.extra_info,
              })),
            }),
          })
        ),
        parseJson(
          await fetch(`/api/venues/${venueId}/event-types`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventTypes: data.eventTypes.map((t) => ({
                event_type_key: t.event_type_key,
                event_type_label: t.event_type_label,
                is_custom: t.is_custom,
              })),
            }),
          })
        ),
        parseJson(
          await fetch(`/api/venues/${venueId}/calendar-settings`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              calendarSettings: data.calendarSettings,
              blackoutDates: data.blackoutDates.map((b) => ({
                start_date: b.start_date,
                end_date: b.end_date,
                reason: b.reason,
              })),
            }),
          })
        ),
        parseJson(
          await fetch(`/api/venues/${venueId}/ai-settings`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data.aiSettings || {}),
          })
        ),
      ])

      await syncPackagesAndAddons(data.packages, data.packageAddons)
      await syncTestimonials(data.testimonials)

      setDirty(false)
      setLastSavedAt(new Date())
      toast({ title: "Saved", description: "Public page changes have been saved." })
      await fetchData()
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save changes"
      toast({ title: "Save failed", description: message, variant: "destructive" })
      throw e
    } finally {
      isSavingRef.current = false
      setSaving(false)
    }
  }, [data, venueId, syncPackagesAndAddons, syncTestimonials, fetchData, toast])

  const updateData = useCallback((updater: (prev: VenuePublicPage) => VenuePublicPage) => {
    setData((prev) => {
      if (!prev) return prev
      historyRef.current = [...historyRef.current.slice(-24), prev]
      setDirty(true)
      return updater(prev)
    })
  }, [])

  const undoLast = useCallback(() => {
    const prev = historyRef.current.pop()
    if (!prev) return
    setData(prev)
    setDirty(true)
    toast({ title: "Undo applied", description: "Reverted the last editor change." })
  }, [toast])

  useEffect(() => {
    if (!venueId) return
    fetchData()
  }, [venueId, fetchData])

  useEffect(() => {
    if (!dirty) return
    const timer = setInterval(() => {
      saveAll().catch(() => {})
    }, 30000)
    return () => clearInterval(timer)
  }, [dirty, saveAll])

  useEffect(() => {
    if (!data) return
    const t = setTimeout(() => setPreviewData(data), 250)
    return () => clearTimeout(t)
  }, [data])

  // Load panel state from localStorage on mount
  useEffect(() => {
    const savedPreviewOpen = localStorage.getItem('publicPageEditor:previewOpen')
    const savedChangesOpen = localStorage.getItem('publicPageEditor:changesOpen')
    if (savedPreviewOpen !== null) setPreviewPanelOpen(savedPreviewOpen === 'true')
    if (savedChangesOpen !== null) setChangesPanelOpen(savedChangesOpen === 'true')
  }, [])

  // Persist preview panel state
  useEffect(() => {
    localStorage.setItem('publicPageEditor:previewOpen', String(previewPanelOpen))
  }, [previewPanelOpen])

  // Persist changes panel state
  useEffect(() => {
    localStorage.setItem('publicPageEditor:changesOpen', String(changesPanelOpen))
  }, [changesPanelOpen])

  // Keyboard shortcuts: Cmd/Ctrl+P for Preview, Cmd/Ctrl+K for Changes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'p') {
          e.preventDefault()
          setPreviewPanelOpen(prev => !prev)
        }
        if (e.key === 'k') {
          e.preventDefault()
          setChangesPanelOpen(prev => !prev)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Count changes for badge
  const changedCount = useMemo(() => {
    if (!baselineData || !data) return 0
    let count = 0
    function changed(a: unknown, b: unknown): boolean {
      return JSON.stringify(a) !== JSON.stringify(b)
    }
    if (changed(baselineData.venue, data.venue)) count++
    if (changed(baselineData.spaces, data.spaces)) count++
    if (changed(baselineData.amenities, data.amenities)) count++
    if (changed(baselineData.eventTypes, data.eventTypes)) count++
    if (changed(baselineData.photos, data.photos)) count++
    if (changed(baselineData.packages, data.packages)) count++
    if (changed(baselineData.addons, data.packageAddons)) count++
    if (changed(baselineData.calendarSettings, data.calendarSettings)) count++
    if (changed(baselineData.blackoutDates, data.blackoutDates)) count++
    if (changed(baselineData.aiSettings, data.aiSettings)) count++
    if (changed(baselineData.testimonials, data.testimonials)) count++
    return count
  }, [baselineData, data])

  const saveStatus = useMemo(() => {
    if (saving) return "Saving..."
    if (dirty) return "Unsaved changes"
    if (lastSavedAt) return `Saved ${lastSavedAt.toLocaleTimeString()}`
    return "All changes saved"
  }, [saving, dirty, lastSavedAt])

  if (loading) return <Loading />
  if (error || !data) return <ErrorMessage message={error || "Failed to load"} onRetry={fetchData} />

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Venues", href: "/venues" },
          { label: data.venue.name || "Venue" },
          { label: "Public Page" },
        ]}
      />

      <div className="sticky top-14 z-30 flex items-center justify-between gap-4 rounded-md border bg-background/95 px-4 py-3 backdrop-blur">
        <div>
          <h1 className="text-2xl font-bold">Public Page Editor</h1>
          <p className="text-sm text-muted-foreground">{saveStatus}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={undoLast}
            disabled={historyRef.current.length === 0 || saving}
          >
            Undo
          </Button>
          <Button onClick={() => saveAll().catch(() => {})} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant={changesPanelOpen ? "secondary" : "outline"}
            size="sm"
            onClick={() => setChangesPanelOpen(prev => !prev)}
            className="relative"
          >
            <ListChecks className="mr-2 h-4 w-4" />
            Changes
            {changedCount > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {changedCount}
              </span>
            )}
          </Button>
          <Button
            variant={previewPanelOpen ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPreviewPanelOpen(prev => !prev)}
          >
            <Monitor className="mr-2 h-4 w-4" />
            Preview
          </Button>
          {data && (
            <PreviewLinkButton 
              venueId={venueId}
              venueSlug={data.venue.slug ?? undefined}
            />
          )}
          <VersionHistory 
            venueId={venueId}
            onVersionRestored={() => {
              fetchData()
              toast({ title: "Version restored", description: "Page restored to previous version." })
            }}
          />
          {data && (
            <>
              <PublishButton 
                venueId={venueId}
                pageData={data}
                isDirty={dirty}
                onPublishSuccess={() => {
                  fetchData()
                }}
              />
              <UnpublishDialog
                venueId={venueId}
                isPublished={data.venue.page_status === "published"}
                onUnpublishSuccess={() => {
                  fetchData()
                }}
              />
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <BasicInfoEditor
                venue={data.venue}
                onChange={(updates) => {
                  updateData((prev) => ({ ...prev, venue: { ...prev.venue, ...updates } }))
                }}
              />
            </TabsContent>

            <TabsContent value="media">
              <PhotosMediaEditor
                venueId={venueId}
                heroImageUrl={data.venue.hero_image_url}
                photos={data.photos}
                onHeroChange={(url) => {
                  updateData((prev) => ({
                    ...prev,
                    venue: { ...prev.venue, hero_image_url: url },
                  }))
                }}
                onPhotosChange={(photos) => {
                  updateData((prev) => ({ ...prev, photos }))
                }}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <SpacesEditor
                spaces={data.spaces}
                onChange={(spaces) => {
                  updateData((prev) => ({ ...prev, spaces }))
                }}
                onAdd={() => {
                  updateData((prev) => ({
                    ...prev,
                    spaces: [
                      ...prev.spaces,
                      {
                        id: `temp-${Date.now()}`,
                        venue_id: prev.venue.id,
                        name: "New Space",
                        capacity: null,
                        space_type: "other",
                        floor_level: null,
                        square_footage: null,
                        hourly_rate: null,
                        setup_time_minutes: null,
                        cleanup_time_minutes: null,
                        amenities: [],
                        notes: null,
                        is_active: true,
                        capacity_standing: null,
                        capacity_theater: null,
                        capacity_custom: null,
                        capacity_custom_label: null,
                        photo_url: null,
                        display_order: prev.spaces.length,
                        public_description: null,
                        created_at: null,
                        updated_at: null,
                      },
                    ],
                  }))
                }}
              />
              <AmenitiesEditor
                amenities={data.amenities}
                onChange={(amenities) => updateData((prev) => ({ ...prev, amenities }))}
              />
              <EventTypesEditor
                eventTypes={data.eventTypes}
                onChange={(eventTypes) => updateData((prev) => ({ ...prev, eventTypes }))}
              />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <CalendarSettingsEditor
                settings={data.calendarSettings}
                onChange={(calendarSettings) => updateData((prev) => ({ ...prev, calendarSettings }))}
              />
              <BlackoutDatesEditor
                blackoutDates={data.blackoutDates}
                onChange={(blackoutDates) => updateData((prev) => ({ ...prev, blackoutDates }))}
              />
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <PackagesEditor
                packages={data.packages}
                onChange={(packages) => updateData((prev) => ({ ...prev, packages }))}
              />
              <AddonsEditor
                addons={data.packageAddons}
                onChange={(packageAddons) => updateData((prev) => ({ ...prev, packageAddons }))}
              />
              <PricingSettingsEditor
                settings={data.aiSettings}
                onChange={(aiSettings) => updateData((prev) => ({ ...prev, aiSettings }))}
              />
            </TabsContent>

            <TabsContent value="ai">
              <AIChatSettingsEditor
                settings={data.aiSettings}
                onChange={(aiSettings) => updateData((prev) => ({ ...prev, aiSettings }))}
              />
            </TabsContent>

            <TabsContent value="contact">
              <ContactSocialEditor
                venue={data.venue}
                onChange={(updates) =>
                  updateData((prev) => ({ ...prev, venue: { ...prev.venue, ...updates } }))
                }
              />
            </TabsContent>

            <TabsContent value="seo">
              <SEOEditor
                venue={data.venue}
                onChange={(updates) =>
                  updateData((prev) => ({ ...prev, venue: { ...prev.venue, ...updates } }))
                }
              />
            </TabsContent>

            <TabsContent value="testimonials">
              <TestimonialsEditor
                testimonials={data.testimonials}
                onChange={(testimonials) => updateData((prev) => ({ ...prev, testimonials }))}
              />
            </TabsContent>

            <TabsContent value="about">
              <AboutEditor
                description={data.venue.description}
                onChange={(description) =>
                  updateData((prev) => ({ ...prev, venue: { ...prev.venue, description } }))
                }
              />
            </TabsContent>
          </Tabs>
      </div>

      {/* Changes Summary Slide Panel */}
      <Sheet open={changesPanelOpen} onOpenChange={setChangesPanelOpen}>
        <SheetContent side="right" className="w-[90vw] sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Changes Tracker</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ChangesSummaryPanel baseline={baselineData} current={data} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Live Preview Slide Panel */}
      <Sheet open={previewPanelOpen} onOpenChange={setPreviewPanelOpen}>
        <SheetContent
          side="right"
          className={`w-[95vw] overflow-y-auto ${
            device === 'desktop' ? 'sm:max-w-[1400px]' :
            device === 'tablet' ? 'sm:max-w-[900px]' :
            'sm:max-w-md'
          }`}
        >
          <SheetHeader>
            <SheetTitle>Live Preview</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {previewData ? (
              <LivePreview data={previewData} device={device} onDeviceChange={setDevice} />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
