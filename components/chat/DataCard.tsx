"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, DollarSign, Users } from "lucide-react"

interface DataCardProps {
  type: "pricing" | "availability" | "summary"
  data: Record<string, unknown>
}

export function DataCard({ type, data }: DataCardProps) {
  if (type === "pricing") {
    return (
      <Card className="my-2 border-blue-200 bg-blue-50/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
            <DollarSign className="h-4 w-4" />
            Pricing Estimate
          </div>
          {data.range != null ? (
            <p className="mt-1 text-lg font-semibold text-blue-900">{String(data.range)}</p>
          ) : null}
          {data.package != null ? (
            <p className="mt-0.5 text-xs text-blue-700">Package: {String(data.package)}</p>
          ) : null}
          {data.note != null ? (
            <p className="mt-1 text-xs text-blue-600">{String(data.note)}</p>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  if (type === "availability") {
    const dates = Array.isArray(data.dates) ? data.dates : []
    return (
      <Card className="my-2 border-green-200 bg-green-50/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800">
            <CalendarDays className="h-4 w-4" />
            Available Dates
          </div>
          {dates.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {dates.map((date: unknown, i: number) => (
                <li key={i} className="text-sm text-green-700">{String(date)}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="my-2">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4" />
          Event Summary
        </div>
        <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {Object.entries(data).map(([key, value]) =>
            value != null ? (
              <div key={key}>
                <dt className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</dt>
                <dd className="font-medium">{String(value)}</dd>
              </div>
            ) : null
          )}
        </dl>
      </CardContent>
    </Card>
  )
}
