'use client'

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { CalendarView } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CalendarHeaderProps {
  view: CalendarView
  currentDate: Date
  onViewChange: (view: CalendarView) => void
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  selectedVenueId?: string
  venues?: Array<{ id: string; venue_name: string }>
  onVenueChange?: (venueId: string) => void
  selectedSpaceId?: string
  spaces?: Array<{ id: string; name: string }>
  onSpaceChange?: (spaceId: string) => void
}

export function CalendarHeader({
  view,
  currentDate,
  onViewChange,
  onNavigate,
  selectedVenueId,
  venues = [],
  onVenueChange,
  selectedSpaceId,
  spaces = [],
  onSpaceChange,
}: CalendarHeaderProps) {
  // Format the date range display based on view
  const getDateRangeText = () => {
    if (view === 'day') {
      return format(currentDate, 'EEEE, MMMM d, yyyy')
    } else if (view === 'week') {
      return format(currentDate, 'MMMM yyyy')
    } else {
      return format(currentDate, 'MMMM yyyy')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Left side - Date navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('today')}
          className="hidden sm:flex"
        >
          Today
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate('prev')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate('next')}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            {getDateRangeText()}
          </h2>
        </div>
      </div>

      {/* Right side - View switcher and filters */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Venue filter */}
        {venues.length > 0 && onVenueChange && (
          <Select value={selectedVenueId || 'all'} onValueChange={onVenueChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Venues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Venues</SelectItem>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.venue_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Space filter */}
        {spaces.length > 0 && onSpaceChange && (
          <Select value={selectedSpaceId || 'all'} onValueChange={onSpaceChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Spaces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Spaces</SelectItem>
              {spaces.map((space) => (
                <SelectItem key={space.id} value={space.id}>
                  {space.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* View switcher */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <Button
            variant={view === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('day')}
            className={`text-xs h-8 ${view === 'day' ? '' : 'hover:bg-white'}`}
          >
            Day
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('week')}
            className={`text-xs h-8 ${view === 'week' ? '' : 'hover:bg-white'}`}
          >
            Week
          </Button>
          <Button
            variant={view === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('month')}
            className={`text-xs h-8 ${view === 'month' ? '' : 'hover:bg-white'}`}
          >
            Month
          </Button>
        </div>
      </div>
    </div>
  )
}
