"use client"

import { useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type LightboxPhoto = {
  id: string
  image_url: string
  caption: string | null
  alt_text: string | null
}

interface LightboxProps {
  photos: LightboxPhoto[]
  currentIndex: number
  onClose: () => void
  onChangeIndex: (index: number) => void
}

export function Lightbox({ photos, currentIndex, onClose, onChangeIndex }: LightboxProps) {
  const photo = photos[currentIndex]

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowLeft") onChangeIndex((currentIndex - 1 + photos.length) % photos.length)
      if (event.key === "ArrowRight") onChangeIndex((currentIndex + 1) % photos.length)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [currentIndex, onClose, onChangeIndex, photos.length])

  if (!photo) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 text-white hover:bg-white/10"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 text-white hover:bg-white/10"
        onClick={() => onChangeIndex((currentIndex - 1 + photos.length) % photos.length)}
        aria-label="Previous photo"
      >
        <ChevronLeft className="h-7 w-7" />
      </Button>

      <div className="relative h-[75vh] w-full max-w-5xl">
        <Image
          src={photo.image_url}
          alt={photo.alt_text || photo.caption || "Venue photo"}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 text-white hover:bg-white/10"
        onClick={() => onChangeIndex((currentIndex + 1) % photos.length)}
        aria-label="Next photo"
      >
        <ChevronRight className="h-7 w-7" />
      </Button>

      {photo.caption && (
        <p className="absolute bottom-5 mx-auto max-w-3xl text-center text-sm text-white/90">
          {photo.caption}
        </p>
      )}
    </div>
  )
}
