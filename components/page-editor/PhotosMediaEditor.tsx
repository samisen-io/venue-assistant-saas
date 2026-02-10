"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PhotoUploader } from "@/components/shared/PhotoUploader"
import { uploadVenuePhoto } from "@/lib/storage/upload"
import type { Database } from "@/lib/types/database.types"

type VenuePhoto = Database["public"]["Tables"]["venue_photos"]["Row"]

export function PhotosMediaEditor({
  venueId,
  heroImageUrl,
  photos,
  onHeroChange,
  onPhotosChange,
}: {
  venueId: string
  heroImageUrl: string | null
  photos: VenuePhoto[]
  onHeroChange: (url: string) => void
  onPhotosChange: (photos: VenuePhoto[]) => void
}) {
  const [section, setSection] = useState("Main Venue")
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const persistPhotoRecords = async (urls: string[]) => {
    if (!urls.length) return
    const payload = urls.map((url, index) => ({
      section_name: section,
      image_url: url,
      display_order: photos.length + index,
    }))

    const res = await fetch(`/api/venues/${venueId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos: payload }),
    })
    if (!res.ok) return
    const created = (await res.json()) as VenuePhoto[]
    onPhotosChange([...photos, ...created])
  }

  const updatePhoto = async (photo: VenuePhoto, updates: Partial<VenuePhoto>) => {
    const next = photos.map((p) => (p.id === photo.id ? { ...p, ...updates } : p))
    onPhotosChange(next)
    await fetch(`/api/venues/${venueId}/photos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos: [{ id: photo.id, ...updates }] }),
    })
  }

  const removePhoto = async (photoId: string) => {
    await fetch(`/api/venues/${venueId}/photos?id=${photoId}`, { method: "DELETE" })
    onPhotosChange(photos.filter((p) => p.id !== photoId))
  }

  const reorder = async (fromId: string, toId: string) => {
    if (fromId === toId) return
    const from = photos.findIndex((p) => p.id === fromId)
    const to = photos.findIndex((p) => p.id === toId)
    if (from < 0 || to < 0) return

    const next = [...photos]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    const normalized = next.map((p, i) => ({ ...p, display_order: i }))
    onPhotosChange(normalized)

    await fetch(`/api/venues/${venueId}/photos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photos: normalized.map((p) => ({ id: p.id, display_order: p.display_order })),
      }),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos & Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Hero image URL</p>
          <Input value={heroImageUrl || ""} onChange={(e) => onHeroChange(e.target.value)} placeholder="https://..." />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Section name</p>
          <Input value={section} onChange={(e) => setSection(e.target.value)} />
        </div>

        <PhotoUploader
          maxFiles={20}
          onUpload={(file) => uploadVenuePhoto(venueId, file, section)}
          onChange={persistPhotoRecords}
        />

        <div className="space-y-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => setDraggingId(photo.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggingId) reorder(draggingId, photo.id)
                setDraggingId(null)
              }}
              className="rounded border p-3 space-y-2"
            >
              <p className="text-xs text-muted-foreground">{photo.image_url}</p>
              <div className="grid gap-2 md:grid-cols-3">
                <Input
                  value={photo.section_name || ""}
                  onChange={(e) => updatePhoto(photo, { section_name: e.target.value })}
                  placeholder="Section"
                />
                <Input
                  value={photo.caption || ""}
                  onChange={(e) => updatePhoto(photo, { caption: e.target.value })}
                  placeholder="Caption"
                />
                <Input
                  value={photo.alt_text || ""}
                  onChange={(e) => updatePhoto(photo, { alt_text: e.target.value })}
                  placeholder="Alt text"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => updatePhoto(photo, { is_section_thumbnail: !photo.is_section_thumbnail })}>
                  {photo.is_section_thumbnail ? "Unset Thumbnail" : "Set Section Thumbnail"}
                </Button>
                <Button type="button" variant="destructive" onClick={() => removePhoto(photo.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
