'use client'

import { useState, useEffect } from 'react'
import { CalendarView } from '@/components/calendar/CalendarView'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { CalendarToolbar } from '@/components/calendar/CalendarToolbar'
import { EventQuickView } from '@/components/calendar/EventQuickView'
import { useCalendarView } from '@/hooks/useCalendarView'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { CalendarEvent, CalendarEventWithVenue, EventStatus, Venue, Space } from '@/lib/types'

export default function CalendarPage() {
  const {
    view,
    setView,
    currentDate,
    setCurrentDate,
    dateRange,
    navigate,
  } = useCalendarView('month')

  const [selectedVenueId, setSelectedVenueId] = useState<string>('all')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('all')
  const [selectedStatuses, setSelectedStatuses] = useState<EventStatus[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [venues, setVenues] = useState<Venue[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithVenue | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

  // Fetch venues and spaces for filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [venuesRes, spacesRes] = await Promise.all([
          fetch('/api/venues'),
          fetch('/api/spaces'),
        ])
        if (venuesRes.ok) {
          const data = await venuesRes.json()
          setVenues(data.venues || [])
        }
        if (spacesRes.ok) {
          const data = await spacesRes.json()
          setSpaces(data || [])
        }
      } catch (error) {
        console.error('Error fetching filters:', error)
      }
    }

    fetchFilters()
  }, [])

  // Fetch calendar events
  const { calendarEvents, isLoading, error, refetch } = useCalendarEvents({
    dateRange,
    venueId: selectedVenueId,
    spaceId: selectedSpaceId,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
  })

  // Filter events by search query
  const filteredEvents = calendarEvents.filter((event) => {
    if (!searchQuery) return true
    return event.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    if (event.resource) {
      setSelectedEvent(event.resource)
      setIsQuickViewOpen(true)
    }
  }

  // Handle slot selection (clicking on empty time slot)
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // You can implement quick event creation here
    console.log('Slot selected:', slotInfo)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 data-testid="calendar-page-title" className="text-3xl font-bold text-slate-900">
          Calendar
        </h1>
        <p className="text-slate-600 mt-1">
          View and manage your event bookings across all venues
        </p>
      </div>

      {/* Calendar Header with navigation and view switcher */}
      <CalendarHeader
        view={view}
        currentDate={currentDate}
        onViewChange={setView}
        onNavigate={navigate}
        selectedVenueId={selectedVenueId}
        venues={venues.map(v => ({ id: v.id, venue_name: v.name }))}
        onVenueChange={setSelectedVenueId}
        selectedSpaceId={selectedSpaceId}
        spaces={spaces.map(s => ({ id: s.id, name: s.name }))}
        onSpaceChange={setSelectedSpaceId}
      />

      {/* Toolbar with filters and search */}
      <CalendarToolbar
        selectedStatuses={selectedStatuses}
        onStatusChange={setSelectedStatuses}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showLegend={true}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={refetch}
            className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Calendar View */}
      <CalendarView
        events={filteredEvents}
        view={view}
        date={currentDate}
        onViewChange={setView}
        onDateChange={setCurrentDate}
        onEventClick={handleEventClick}
        onSelectSlot={handleSelectSlot}
        isLoading={isLoading}
      />

      {/* Event Quick View Dialog */}
      <EventQuickView
        event={selectedEvent}
        open={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false)
          setSelectedEvent(null)
        }}
      />
    </div>
  )
}
