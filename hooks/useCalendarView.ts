import { useState, useCallback, useMemo } from 'react'
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns'
import { CalendarView, DateRange } from '@/lib/types'
import { getDayBounds, getWeekBounds, getMonthBounds } from '@/lib/utils/calendar'

export function useCalendarView(initialView: CalendarView = 'month') {
  const [view, setView] = useState<CalendarView>(initialView)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  // Calculate date range based on current view
  const dateRange = useMemo((): DateRange => {
    switch (view) {
      case 'day':
        return getDayBounds(currentDate)
      case 'week':
        return getWeekBounds(currentDate)
      case 'month':
        return getMonthBounds(currentDate)
      default:
        return getMonthBounds(currentDate)
    }
  }, [view, currentDate])

  // Navigate to previous period
  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => {
      switch (view) {
        case 'day':
          return subDays(prev, 1)
        case 'week':
          return subWeeks(prev, 1)
        case 'month':
          return subMonths(prev, 1)
        default:
          return prev
      }
    })
  }, [view])

  // Navigate to next period
  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      switch (view) {
        case 'day':
          return addDays(prev, 1)
        case 'week':
          return addWeeks(prev, 1)
        case 'month':
          return addMonths(prev, 1)
        default:
          return prev
      }
    })
  }, [view])

  // Go to today
  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // Go to specific date
  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  // Navigate by direction
  const navigate = useCallback(
    (direction: 'prev' | 'next' | 'today') => {
      switch (direction) {
        case 'prev':
          goToPrevious()
          break
        case 'next':
          goToNext()
          break
        case 'today':
          goToToday()
          break
      }
    },
    [goToPrevious, goToNext, goToToday]
  )

  return {
    view,
    setView,
    currentDate,
    setCurrentDate,
    dateRange,
    goToPrevious,
    goToNext,
    goToToday,
    goToDate,
    navigate,
  }
}
