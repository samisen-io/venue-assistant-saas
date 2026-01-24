'use client'

import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { CalendarEvent, CalendarView as ViewType } from '@/lib/types'
import { getEventColor } from '@/lib/utils/calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarViewProps {
  events: CalendarEvent[]
  view: ViewType
  date: Date
  onViewChange: (view: ViewType) => void
  onDateChange: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
  isLoading?: boolean
}

export function CalendarView({
  events,
  view,
  date,
  onViewChange,
  onDateChange,
  onEventClick,
  onSelectSlot,
  isLoading = false,
}: CalendarViewProps) {
  // Convert view to react-big-calendar format
  const calendarView: View = view === 'day' ? 'day' : view === 'week' ? 'week' : 'month'

  // Event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.status || 'planning'
    const colorConfig = getEventColor(status)

    return {
      style: {
        backgroundColor: colorConfig.backgroundColor,
        borderLeft: `4px solid ${colorConfig.borderColor}`,
        color: colorConfig.textColor,
        borderRadius: '4px',
        padding: '2px 5px',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-white rounded-lg border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-container bg-white rounded-lg border p-4" style={{ height: '700px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        view={calendarView}
        date={date}
        onView={(newView) => onViewChange(newView as ViewType)}
        onNavigate={onDateChange}
        onSelectEvent={onEventClick}
        onSelectSlot={onSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        step={30}
        showMultiDayTimes
        defaultView="month"
        popup
        style={{ height: '100%' }}
        className="custom-calendar"
      />
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
          font-size: 0.875rem;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
        }
        .rbc-today {
          background-color: #eff6ff;
        }
        .rbc-off-range-bg {
          background-color: #f8fafc;
        }
        .rbc-event {
          padding: 2px 5px;
          border-radius: 3px;
          cursor: pointer;
        }
        .rbc-event:hover {
          opacity: 0.85;
        }
        .rbc-event-label {
          font-size: 0.75rem;
        }
        .rbc-event-content {
          font-size: 0.875rem;
        }
        .rbc-toolbar {
          display: none;
        }
        .rbc-month-view {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .rbc-time-view {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .rbc-time-header {
          border-bottom: 2px solid #e2e8f0;
        }
        .rbc-time-content {
          border-top: none;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f1f5f9;
        }
        .rbc-current-time-indicator {
          background-color: #2563eb;
          height: 2px;
        }
      `}</style>
    </div>
  )
}
