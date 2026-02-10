"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Database, Json } from "@/lib/types/database.types"

type VenuePackage = Database["public"]["Tables"]["venue_packages"]["Row"]

export function PackagesEditor({
  packages,
  onChange,
}: {
  packages: VenuePackage[]
  onChange: (next: VenuePackage[]) => void
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const patch = (id: string, updates: Partial<VenuePackage>) =>
    onChange(packages.map((pkg) => (pkg.id === id ? { ...pkg, ...updates } : pkg)))

  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return
    const from = packages.findIndex((p) => p.id === fromId)
    const to = packages.findIndex((p) => p.id === toId)
    if (from < 0 || to < 0) return
    const next = [...packages]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next.map((p, i) => ({ ...p, display_order: i })))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Packages</CardTitle>
        <Button
          type="button"
          onClick={() =>
            onChange([
              ...packages,
              {
                id: `temp-${Date.now()}`,
                venue_id: packages[0]?.venue_id || "",
                name: "New Package",
                description: null,
                base_price: 0,
                pricing_model: "flat",
                tiered_pricing: null,
                inclusions: null,
                is_visible_on_public_page: true,
                display_order: packages.length,
                created_at: null,
                updated_at: null,
              },
            ])
          }
        >
          Add Package
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            draggable
            onDragStart={() => setDraggingId(pkg.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggingId) reorder(draggingId, pkg.id)
              setDraggingId(null)
            }}
            className="space-y-2 rounded border p-3"
          >
            <div className="grid gap-2 md:grid-cols-4">
              <Input value={pkg.name} onChange={(e) => patch(pkg.id, { name: e.target.value })} placeholder="Name" />
              <Input type="number" value={pkg.base_price} onChange={(e) => patch(pkg.id, { base_price: Number(e.target.value) })} placeholder="Base price" />
              <Select value={pkg.pricing_model || "flat"} onValueChange={(v) => patch(pkg.id, { pricing_model: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat</SelectItem>
                  <SelectItem value="per_person">Per Person</SelectItem>
                  <SelectItem value="per_hour">Per Hour</SelectItem>
                  <SelectItem value="tiered">Tiered</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch checked={Boolean(pkg.is_visible_on_public_page)} onCheckedChange={(v) => patch(pkg.id, { is_visible_on_public_page: v })} />
                <span className="text-sm">Visible</span>
              </div>
            </div>
            <Textarea value={pkg.description || ""} onChange={(e) => patch(pkg.id, { description: e.target.value })} placeholder="Description" />
            <Textarea
              value={JSON.stringify((pkg.inclusions || []) as Json, null, 2)}
              onChange={(e) => {
                try {
                  patch(pkg.id, { inclusions: JSON.parse(e.target.value) as Json })
                } catch {
                  // keep raw edits until valid json on next keystroke
                }
              }}
              placeholder="Inclusions JSON"
              className="font-mono text-xs"
            />
            <Textarea
              value={JSON.stringify((pkg.tiered_pricing || null) as Json, null, 2)}
              onChange={(e) => {
                try {
                  patch(pkg.id, { tiered_pricing: JSON.parse(e.target.value) as Json })
                } catch {
                  // keep raw edits until valid json on next keystroke
                }
              }}
              placeholder="Tiered pricing JSON"
              className="font-mono text-xs"
            />
            <Button type="button" variant="destructive" onClick={() => onChange(packages.filter((p) => p.id !== pkg.id))}>
              Remove Package
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
