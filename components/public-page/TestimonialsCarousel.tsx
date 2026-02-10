"use client"

import { useEffect, useState } from "react"
import { Quote, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

type Testimonial = {
  id: string
  quote: string
  client_name: string
  client_company: string | null
  event_type: string | null
  star_rating: number | null
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || testimonials.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length)
    }, 8000)
    return () => window.clearInterval(id)
  }, [paused, testimonials.length])

  if (testimonials.length === 0) return null
  const active = testimonials[index]

  return (
    <section
      className="space-y-4 rounded-xl border bg-card p-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h2 className="text-2xl font-semibold">Testimonials</h2>
      <div className="space-y-3">
        <Quote className="h-6 w-6 text-muted-foreground" />
        <p className="text-lg leading-relaxed">{active.quote}</p>
        <p className="text-sm text-muted-foreground">
          {active.client_name}
          {active.client_company ? `, ${active.client_company}` : ""}
          {active.event_type ? ` · ${active.event_type}` : ""}
        </p>
        {active.star_rating ? (
          <p className="inline-flex items-center gap-1 text-amber-600">
            {Array.from({ length: active.star_rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-primary" : "bg-muted-foreground/40"}`}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}>
            Prev
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIndex((i) => (i + 1) % testimonials.length)}>
            Next
          </Button>
        </div>
      </div>
    </section>
  )
}
