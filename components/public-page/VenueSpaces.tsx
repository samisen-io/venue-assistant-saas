"use client"

import { Building2, Trees, Users, WavesLadder, Briefcase, Landmark } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ComponentType } from "react"

type Space = {
  id: string
  name: string
  space_type: string | null
  capacity: number | null
  capacity_standing: number | null
  capacity_theater: number | null
  photo_url: string | null
  public_description: string | null
}

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  ballroom: Landmark,
  conference_room: Briefcase,
  meeting_room: Building2,
  outdoor_garden: Trees,
  rooftop: WavesLadder,
  banquet_hall: Users,
  other: Building2,
}

interface VenueSpacesProps {
  spaces: Space[]
}

export function VenueSpaces({ spaces }: VenueSpacesProps) {
  return (
    <section id="spaces" className="space-y-4">
      <h2 className="text-2xl font-semibold">Event Spaces</h2>
      {spaces.length === 0 ? (
        <p className="text-muted-foreground">No spaces are listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {spaces.map((space) => {
            const Icon = ICONS[space.space_type || "other"] || Building2
            return (
              <Card key={space.id} className="border-muted/70 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-4 w-4" />
                    {space.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Seated: {space.capacity ?? "N/A"} | Standing: {space.capacity_standing ?? "N/A"} |
                    Theater: {space.capacity_theater ?? "N/A"}
                  </p>
                  {space.public_description && <p>{space.public_description}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
