"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"

interface HeroSectionProps {
  name: string
  city?: string | null
  state?: string | null
  tagline?: string | null
  heroImageUrl?: string | null
}

async function isImageDark(imageUrl: string): Promise<boolean> {
  try {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("Image load failed"))
    })
    const canvas = document.createElement("canvas")
    canvas.width = 12
    canvas.height = 12
    const ctx = canvas.getContext("2d")
    if (!ctx) return true
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let sum = 0
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3
    }
    return sum / (data.length / 4) < 130
  } catch {
    return true
  }
}

export function HeroSection({ name, city, state, tagline, heroImageUrl }: HeroSectionProps) {
  const [darkImage, setDarkImage] = useState(true)
  const location = useMemo(() => [city, state].filter(Boolean).join(", "), [city, state])

  useEffect(() => {
    if (!heroImageUrl) return
    isImageDark(heroImageUrl).then(setDarkImage)
  }, [heroImageUrl])

  return (
    <section className="relative h-[40vh] min-h-[320px] overflow-hidden md:h-[60vh]">
      {heroImageUrl ? (
        <Image
          src={heroImageUrl}
          alt={`${name} hero image`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-400" />
      )}
      <div
        className={`absolute inset-0 ${
          darkImage ? "bg-gradient-to-b from-black/40 via-black/55 to-black/75" : "bg-black/45"
        }`}
      />

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center px-6 text-center text-white">
        <p className="mb-2 text-sm uppercase tracking-[0.2em]">{location || "Event Venue"}</p>
        <h1 className="text-3xl font-bold md:text-5xl">{name}</h1>
        {tagline && <p className="mt-3 max-w-2xl text-base md:text-lg">{tagline}</p>}
      </div>
    </section>
  )
}
