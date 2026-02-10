"use client"

import { useState } from "react"
import Image from "next/image"
import { Lightbox } from "./Lightbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type VenuePhoto = {
  id: string
  section_name: string
  image_url: string
  caption: string | null
  alt_text: string | null
  is_section_thumbnail: boolean | null
}

interface PhotoGalleryProps {
  photos: VenuePhoto[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sectionMap = new Map<string, VenuePhoto[]>()
  for (const photo of photos) {
    const key = photo.section_name || "Gallery"
    const list = sectionMap.get(key) || []
    list.push(photo)
    sectionMap.set(key, list)
  }
  const sections = [
    { key: "all", label: "All Photos", photos },
    ...Array.from(sectionMap.entries()).map(([section, sectionPhotos], index) => ({
      key: `${section.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
      label: section,
      photos: sectionPhotos,
    })),
  ]
  const [activeTab, setActiveTab] = useState(sections[0].key)

  const activePhotos = sections.find((section) => section.key === activeTab)?.photos ?? photos
  if (photos.length === 0) return null

  return (
    <section id="gallery" className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Photo Gallery</h2>
        <p className="mt-1 text-muted-foreground">Explore the venue and event spaces.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto whitespace-nowrap rounded-lg bg-muted/40 p-1">
          {sections.map((section) => (
            <TabsTrigger key={section.key} value={section.key} className="rounded-md px-3 py-1.5">
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.key} value={section.key}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border text-left"
                  onClick={() => setLightboxIndex(index)}
                >
                  <Image
                    src={photo.image_url}
                    alt={photo.alt_text || photo.caption || "Venue photo"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                  {photo.is_section_thumbnail && (
                    <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                      Featured
                    </span>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {lightboxIndex !== null && (
        <Lightbox
          photos={activePhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      )}
    </section>
  )
}
