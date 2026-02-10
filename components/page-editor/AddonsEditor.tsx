"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/types/database.types"

type Addon = Database["public"]["Tables"]["venue_package_addons"]["Row"]

export function AddonsEditor({
  addons,
  onChange,
}: {
  addons: Addon[]
  onChange: (next: Addon[]) => void
}) {
  const patch = (id: string, updates: Partial<Addon>) =>
    onChange(addons.map((addon) => (addon.id === id ? { ...addon, ...updates } : addon)))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add-ons</CardTitle>
        <Button
          type="button"
          onClick={() =>
            onChange([
              ...addons,
              {
                id: `temp-${Date.now()}`,
                venue_id: addons[0]?.venue_id || "",
                name: "New Add-on",
                description: null,
                price: 0,
                available_with_packages: null,
                created_at: null,
              },
            ])
          }
        >
          Add Add-on
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {addons.map((addon) => (
          <div key={addon.id} className="space-y-2 rounded border p-3">
            <div className="grid gap-2 md:grid-cols-2">
              <Input value={addon.name} onChange={(e) => patch(addon.id, { name: e.target.value })} />
              <Input type="number" value={addon.price} onChange={(e) => patch(addon.id, { price: Number(e.target.value) })} />
            </div>
            <Textarea value={addon.description || ""} onChange={(e) => patch(addon.id, { description: e.target.value })} />
            <Input
              value={(addon.available_with_packages || []).join(",")}
              onChange={(e) => patch(addon.id, { available_with_packages: e.target.value ? e.target.value.split(",").map((x) => x.trim()) : [] })}
              placeholder="Comma-separated package IDs"
            />
            <Button type="button" variant="destructive" onClick={() => onChange(addons.filter((a) => a.id !== addon.id))}>
              Remove Add-on
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
