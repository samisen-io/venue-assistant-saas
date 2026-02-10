"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/types/database.types"

type Space = Database["public"]["Tables"]["spaces"]["Row"]

export function SpacesEditor({
  spaces,
  onChange,
  onAdd,
}: {
  spaces: Space[]
  onChange: (spaces: Space[]) => void
  onAdd: () => void
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const patch = (id: string, updates: Partial<Space>) => {
    onChange(spaces.map((space) => (space.id === id ? { ...space, ...updates } : space)))
  }

  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return
    const from = spaces.findIndex((s) => s.id === fromId)
    const to = spaces.findIndex((s) => s.id === toId)
    if (from < 0 || to < 0) return
    const next = [...spaces]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next.map((s, idx) => ({ ...s, display_order: idx })))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Spaces</CardTitle>
        <Button type="button" onClick={onAdd}>Add Space</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {spaces.map((space, index) => (
          <div
            key={space.id}
            draggable
            onDragStart={() => setDraggingId(space.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggingId) reorder(draggingId, space.id)
              setDraggingId(null)
            }}
            className="rounded border p-3 space-y-2"
          >
            <div className="grid gap-2 md:grid-cols-3">
              <Input value={space.name || ""} onChange={(e) => patch(space.id, { name: e.target.value })} placeholder="Space name" />
              <Input type="number" value={space.capacity ?? ""} onChange={(e) => patch(space.id, { capacity: e.target.value ? Number(e.target.value) : null })} placeholder="Seated capacity" />
              <Input type="number" value={space.capacity_standing ?? ""} onChange={(e) => patch(space.id, { capacity_standing: e.target.value ? Number(e.target.value) : null })} placeholder="Standing capacity" />
              <Input type="number" value={space.capacity_theater ?? ""} onChange={(e) => patch(space.id, { capacity_theater: e.target.value ? Number(e.target.value) : null })} placeholder="Theater capacity" />
              <Input type="number" value={space.capacity_custom ?? ""} onChange={(e) => patch(space.id, { capacity_custom: e.target.value ? Number(e.target.value) : null })} placeholder="Custom capacity" />
              <Input value={space.capacity_custom_label || ""} onChange={(e) => patch(space.id, { capacity_custom_label: e.target.value })} placeholder="Custom label" />
              <Input value={space.photo_url || ""} onChange={(e) => patch(space.id, { photo_url: e.target.value })} placeholder="Photo URL" />
              <Input type="number" value={space.display_order ?? index} onChange={(e) => patch(space.id, { display_order: e.target.value ? Number(e.target.value) : 0 })} placeholder="Display order" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
