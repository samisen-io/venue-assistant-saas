/**
 * Checks venue-level availability for the public AI chat.
 * Queries venue_availability, venue_blackout_dates, and venue_calendar_settings.
 */

import { createServiceRoleClient } from "@/lib/supabase/server"

export interface AvailabilityResult {
  date: string
  available: boolean
  status: "available" | "tentative" | "booked" | "blackout" | "too_soon" | "too_far"
  note?: string
}

export interface AlternativeDate {
  date: string
  status: "available" | "tentative"
}

export async function checkAvailability(
  venueId: string,
  date: string
): Promise<AvailabilityResult> {
  const supabase = createServiceRoleClient()

  // Load calendar settings
  const { data: settings } = await (supabase as any)
    .from("venue_calendar_settings")
    .select("*")
    .eq("venue_id", venueId)
    .limit(1)
    .single()

  const today = new Date()
  const targetDate = new Date(date)

  // Check minimum advance booking
  if (settings?.min_advance_booking_days) {
    const minDate = new Date(today)
    minDate.setDate(minDate.getDate() + settings.min_advance_booking_days)
    if (targetDate < minDate) {
      return {
        date,
        available: false,
        status: "too_soon",
        note: `Minimum ${settings.min_advance_booking_days} days advance booking required.`,
      }
    }
  }

  // Check maximum advance booking
  if (settings?.max_advance_booking_months) {
    const maxDate = new Date(today)
    maxDate.setMonth(maxDate.getMonth() + settings.max_advance_booking_months)
    if (targetDate > maxDate) {
      return {
        date,
        available: false,
        status: "too_far",
        note: `Bookings only accepted up to ${settings.max_advance_booking_months} months in advance.`,
      }
    }
  }

  // Check blackout dates
  const { data: blackouts } = await (supabase as any)
    .from("venue_blackout_dates")
    .select("*")
    .eq("venue_id", venueId)
    .lte("start_date", date)
    .gte("end_date", date)

  if (blackouts && blackouts.length > 0) {
    return {
      date,
      available: false,
      status: "blackout",
      note: blackouts[0].reason || "This date is unavailable.",
    }
  }

  // Check venue_availability table
  const { data: avail } = await (supabase as any)
    .from("venue_availability")
    .select("*")
    .eq("venue_id", venueId)
    .eq("date", date)
    .limit(1)
    .single()

  if (avail) {
    return {
      date,
      available: avail.status === "available" || avail.status === "tentative",
      status: avail.status,
      note: avail.note || undefined,
    }
  }

  // No record means available by default
  return { date, available: true, status: "available" }
}

export async function suggestAlternativeDates(
  venueId: string,
  targetDate: string,
  rangeDays: number = 14
): Promise<AlternativeDate[]> {
  const supabase = createServiceRoleClient()
  const target = new Date(targetDate)
  const startDate = new Date(target)
  startDate.setDate(startDate.getDate() - rangeDays)
  const endDate = new Date(target)
  endDate.setDate(endDate.getDate() + rangeDays)

  const startStr = startDate.toISOString().split("T")[0]
  const endStr = endDate.toISOString().split("T")[0]

  // Get all booked/tentative dates in range
  const { data: bookedDates } = await (supabase as any)
    .from("venue_availability")
    .select("date, status")
    .eq("venue_id", venueId)
    .gte("date", startStr)
    .lte("date", endStr)
    .eq("status", "booked")

  const { data: blackouts } = await (supabase as any)
    .from("venue_blackout_dates")
    .select("start_date, end_date")
    .eq("venue_id", venueId)
    .lte("start_date", endStr)
    .gte("end_date", startStr)

  const bookedSet = new Set(
    (bookedDates ?? []).map((d: { date: string }) => d.date)
  )

  // Add blackout date ranges to booked set
  for (const b of blackouts ?? []) {
    const bStart = new Date(b.start_date)
    const bEnd = new Date(b.end_date)
    for (let d = new Date(bStart); d <= bEnd; d.setDate(d.getDate() + 1)) {
      bookedSet.add(d.toISOString().split("T")[0])
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const alternatives: AlternativeDate[] = []

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (d <= today) continue
    const dateStr = d.toISOString().split("T")[0]
    if (dateStr === targetDate) continue
    if (!bookedSet.has(dateStr)) {
      alternatives.push({ date: dateStr, status: "available" })
    }
    if (alternatives.length >= 5) break
  }

  return alternatives
}
