/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/types/database.types"

type VenueRow = Pick<Database["public"]["Tables"]["venues"]["Row"], "id" | "page_status">
type VenueAvailabilityRow = Pick<Database["public"]["Tables"]["venue_availability"]["Row"], "date" | "status" | "note">
type VenueBlackoutRow = Pick<Database["public"]["Tables"]["venue_blackout_dates"]["Row"], "start_date" | "end_date">
type VenueCalendarSettingsRow = Database["public"]["Tables"]["venue_calendar_settings"]["Row"]

function toDateOnly(value: Date): string {
  return value.toISOString().split("T")[0]
}

function parseMonthInput(value: string | null): { year: number; month: number } | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) return null
  return { year, month }
}

function addDays(base: Date, days: number): Date {
  const copy = new Date(base)
  copy.setDate(copy.getDate() + days)
  return copy
}

function addMonths(base: Date, months: number): Date {
  const copy = new Date(base)
  copy.setMonth(copy.getMonth() + months)
  return copy
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const monthInput = parseMonthInput(searchParams.get("month"))
    if (!monthInput) {
      return NextResponse.json(
        { error: "Invalid month. Expected YYYY-MM" },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()
    const { data: venues, error: venueError } = await (supabase as any)
      .from("venues")
      .select("id, page_status")
      .eq("slug", slug)
      .limit(1)

    if (venueError) throw venueError
    const venue = (venues?.[0] as VenueRow | undefined) ?? null
    if (!venue || venue.page_status !== "published") {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    const monthStart = new Date(Date.UTC(monthInput.year, monthInput.month - 1, 1))
    const monthEnd = new Date(Date.UTC(monthInput.year, monthInput.month, 0))

    const [availabilityRes, blackoutRes, settingsRes] = await Promise.all([
      (supabase as any)
        .from("venue_availability")
        .select("date,status,note")
        .eq("venue_id", venue.id)
        .gte("date", toDateOnly(monthStart))
        .lte("date", toDateOnly(monthEnd)),
      (supabase as any)
        .from("venue_blackout_dates")
        .select("start_date,end_date")
        .eq("venue_id", venue.id)
        .lte("start_date", toDateOnly(monthEnd))
        .gte("end_date", toDateOnly(monthStart)),
      (supabase as any)
        .from("venue_calendar_settings")
        .select("*")
        .eq("venue_id", venue.id)
        .limit(1),
    ])

    const settings = ((settingsRes.data ?? [])[0] as VenueCalendarSettingsRow | undefined) ?? null
    const minLeadDays = settings?.min_advance_booking_days ?? 14
    const maxAdvanceMonths = settings?.max_advance_booking_months ?? 12
    const setupBufferDays = settings?.setup_buffer_days ?? 0
    const teardownBufferDays = settings?.teardown_buffer_days ?? 0

    const today = new Date()
    const leadMinDate = addDays(today, minLeadDays)
    const maxDate = addMonths(today, maxAdvanceMonths)

    const map = new Map<string, { status: "available" | "tentative" | "booked"; note?: string }>()
    for (const row of (availabilityRes.data ?? []) as VenueAvailabilityRow[]) {
      map.set(row.date, {
        status: (row.status as "available" | "tentative" | "booked") ?? "available",
        note: row.note ?? undefined,
      })
    }

    const bufferedDates = new Set<string>()
    for (const [date, value] of map.entries()) {
      if (value.status === "available") continue
      const target = new Date(date)
      for (let i = 1; i <= setupBufferDays; i++) bufferedDates.add(toDateOnly(addDays(target, -i)))
      for (let i = 1; i <= teardownBufferDays; i++) bufferedDates.add(toDateOnly(addDays(target, i)))
    }

    const results: Array<{ date: string; status: "available" | "tentative" | "booked"; note?: string }> = []

    for (let day = 1; day <= monthEnd.getUTCDate(); day++) {
      const d = new Date(Date.UTC(monthInput.year, monthInput.month - 1, day))
      const dateKey = toDateOnly(d)
      const existing = map.get(dateKey)

      let status: "available" | "tentative" | "booked" = existing?.status ?? "available"
      let note = existing?.note

      if (d < new Date(toDateOnly(today)) || d < leadMinDate || d > maxDate) {
        status = "booked"
        note = "Outside booking window"
      }

      for (const b of (blackoutRes.data ?? []) as VenueBlackoutRow[]) {
        if (dateKey >= b.start_date && dateKey <= b.end_date) {
          status = "booked"
          note = "Blackout date"
          break
        }
      }

      if (status === "available" && bufferedDates.has(dateKey)) {
        status = "tentative"
        note = "Setup/teardown buffer"
      }

      results.push({ date: dateKey, status, note })
    }

    return NextResponse.json(
      { month: `${monthInput.year}-${String(monthInput.month).padStart(2, "0")}`, availability: results },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.error("Error fetching public availability:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
