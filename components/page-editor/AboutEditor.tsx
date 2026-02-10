"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export function AboutEditor({
  description,
  onChange,
}: {
  description: string | null
  onChange: (value: string) => void
}) {
  const value = description || ""
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Textarea
          className="min-h-[160px]"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 1000))}
          placeholder="Describe your venue, vibe, and what makes it unique..."
        />
        <p className="text-xs text-muted-foreground">{value.length}/1000</p>
      </CardContent>
    </Card>
  )
}
