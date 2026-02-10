"use client"

import { useState } from "react"
import type { Database } from "@/lib/types/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

type Testimonial = Database["public"]["Tables"]["venue_testimonials"]["Row"]

export function TestimonialsEditor({
  testimonials,
  onChange,
}: {
  testimonials: Testimonial[]
  onChange: (next: Testimonial[]) => void
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const patch = (id: string, updates: Partial<Testimonial>) =>
    onChange(testimonials.map((t) => (t.id === id ? { ...t, ...updates } : t)))

  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return
    const from = testimonials.findIndex((t) => t.id === fromId)
    const to = testimonials.findIndex((t) => t.id === toId)
    if (from < 0 || to < 0) return
    const next = [...testimonials]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next.map((t, i) => ({ ...t, display_order: i })))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Testimonials</CardTitle>
        <Button
          type="button"
          onClick={() =>
            onChange([
              ...testimonials,
              {
                id: `temp-${Date.now()}`,
                venue_id: testimonials[0]?.venue_id || "",
                client_name: "",
                client_company: null,
                event_type: null,
                quote: "",
                star_rating: 5,
                client_photo_url: null,
                event_date: null,
                event_id: null,
                is_published: false,
                display_order: testimonials.length,
                source: "manual",
                created_at: null,
              },
            ])
          }
        >
          Add Testimonial
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {testimonials.map((t) => (
          <div
            key={t.id}
            draggable
            onDragStart={() => setDraggingId(t.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggingId) reorder(draggingId, t.id)
              setDraggingId(null)
            }}
            className="space-y-2 rounded border p-3"
          >
            <div className="grid gap-2 md:grid-cols-3">
              <Input value={t.client_name || ""} onChange={(e) => patch(t.id, { client_name: e.target.value })} placeholder="Client name" />
              <Input value={t.client_company || ""} onChange={(e) => patch(t.id, { client_company: e.target.value })} placeholder="Company" />
              <Input value={t.event_type || ""} onChange={(e) => patch(t.id, { event_type: e.target.value })} placeholder="Event type" />
              <Input type="date" value={t.event_date || ""} onChange={(e) => patch(t.id, { event_date: e.target.value })} />
              <Input type="number" min={1} max={5} value={t.star_rating ?? 5} onChange={(e) => patch(t.id, { star_rating: Number(e.target.value) })} />
              <Input value={t.client_photo_url || ""} onChange={(e) => patch(t.id, { client_photo_url: e.target.value })} placeholder="Photo URL" />
            </div>
            <Textarea value={t.quote || ""} onChange={(e) => patch(t.id, { quote: e.target.value })} placeholder="Quote" />
            <div className="flex items-center gap-2">
              <Switch checked={Boolean(t.is_published)} onCheckedChange={(v) => patch(t.id, { is_published: v })} />
              <span className="text-sm">Published</span>
              <Button type="button" variant="destructive" onClick={() => onChange(testimonials.filter((x) => x.id !== t.id))}>Delete</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
