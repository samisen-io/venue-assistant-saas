import { Badge } from "@/components/ui/badge"

type EventType = {
  id: string
  event_type_label: string
}

interface EventTypeBadgesProps {
  eventTypes: EventType[]
}

export function EventTypeBadges({ eventTypes }: EventTypeBadgesProps) {
  if (eventTypes.length === 0) return null
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Perfect For</h2>
      <div className="flex flex-wrap gap-2">
        {eventTypes.map((item) => (
          <Badge key={item.id} variant="secondary" className="px-3 py-1 text-sm">
            {item.event_type_label}
          </Badge>
        ))}
      </div>
    </section>
  )
}
