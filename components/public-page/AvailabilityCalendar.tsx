"use client"

import { useEffect, useMemo, useState } from "react"
import { addMonths, eachDayOfInterval, endOfMonth, format, isBefore, isSameMonth, startOfMonth } from "date-fns"
import { ChevronLeft, ChevronRight, CircleCheck, CircleOff, CircleDashed } from "lucide-react"
import { Button } from "@/components/ui/button"

type AvailabilityStatus = "available" | "tentative" | "booked"
type AvailabilityItem = { date: string; status: AvailabilityStatus; note?: string }

interface AvailabilityCalendarProps {
  slug: string
}

function statusUi(status: AvailabilityStatus) {
  if (status === "available") return { label: "Available", className: "bg-emerald-100 text-emerald-800", icon: CircleCheck }
  if (status === "tentative") return { label: "Tentative", className: "bg-amber-100 text-amber-800", icon: CircleDashed }
  return { label: "Booked", className: "bg-slate-200 text-slate-700", icon: CircleOff }
}

export function AvailabilityCalendar({ slug }: AvailabilityCalendarProps) {
  const [monthDate, setMonthDate] = useState(startOfMonth(new Date()))
  const [items, setItems] = useState<Record<string, AvailabilityItem>>({})

  const monthKey = format(monthDate, "yyyy-MM")

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/venues/public/${slug}/availability?month=${monthKey}`)
      if (!res.ok) return
      const data = await res.json()
      const next: Record<string, AvailabilityItem> = {}
      for (const item of data.availability || []) next[item.date] = item
      setItems(next)
    }
    load()
  }, [monthKey, slug])

  const days = useMemo(() => {
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    return eachDayOfInterval({ start, end })
  }, [monthDate])

  return (
    <section id="availability" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Availability</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setMonthDate(addMonths(monthDate, -1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="min-w-36 text-center text-sm font-medium">{format(monthDate, "MMMM yyyy")}</p>
          <Button variant="outline" size="icon" onClick={() => setMonthDate(addMonths(monthDate, 1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const item = items[key]
          const status = item?.status || "available"
          const ui = statusUi(status)
          const Icon = ui.icon
          const isPast = isBefore(day, new Date()) && !isSameMonth(day, new Date())
          return (
            <button
              key={key}
              className={`min-h-11 rounded border p-1 text-left text-xs ${ui.className} ${isPast ? "opacity-50" : ""}`}
              title={item?.note || ui.label}
              onClick={() => {
                if (status !== "available") return
                const el = document.getElementById("ai-chat")
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
            >
              <div className="flex items-center justify-between">
                <span>{format(day, "d")}</span>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><CircleCheck className="h-3.5 w-3.5 text-emerald-700" />Available</span>
        <span className="inline-flex items-center gap-1"><CircleDashed className="h-3.5 w-3.5 text-amber-700" />Tentative</span>
        <span className="inline-flex items-center gap-1"><CircleOff className="h-3.5 w-3.5 text-slate-700" />Booked</span>
      </div>
    </section>
  )
}
