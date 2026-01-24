'use client'

import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarEventWithVenue } from '@/lib/types'
import { Calendar, Clock, MapPin, Users, DollarSign, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils/format'

interface EventQuickViewProps {
  event: CalendarEventWithVenue | null
  open: boolean
  onClose: () => void
}

const statusColors = {
  planning: 'bg-slate-100 text-slate-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function EventQuickView({ event, open, onClose }: EventQuickViewProps) {
  const router = useRouter()

  if (!event) return null

  const handleViewDetails = () => {
    router.push(`/events/${event.id}`)
    onClose()
  }

  const handleEdit = () => {
    router.push(`/events/${event.id}/edit`)
    onClose()
  }

  const eventDate = typeof event.event_date === 'string'
    ? new Date(event.event_date)
    : event.event_date

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl pr-8">{event.event_name}</DialogTitle>
            <Badge className={statusColors[event.status as keyof typeof statusColors]}>
              {event.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Event Type */}
          {event.event_type && (
            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-700">Event Type</p>
                <p className="text-sm text-slate-600 capitalize">{event.event_type}</p>
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-700">Date</p>
              <p className="text-sm text-slate-600">
                {format(eventDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-700">Time</p>
              <p className="text-sm text-slate-600">
                {event.event_time || 'Time not set'}
              </p>
            </div>
          </div>

          {/* Venue and Space */}
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-700">Location</p>
              <p className="text-sm text-slate-600">
                {event.venue_name || 'No venue assigned'}
                {event.space_name && ` - ${event.space_name}`}
              </p>
            </div>
          </div>

          {/* Guest Count */}
          {event.guest_count && (
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-700">Expected Guests</p>
                <p className="text-sm text-slate-600">{event.guest_count}</p>
              </div>
            </div>
          )}

          {/* Budget */}
          {event.budget_total && (
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-700">Budget</p>
                <p className="text-sm text-slate-600">
                  {formatCurrency(event.budget_total)}
                </p>
              </div>
            </div>
          )}

          {/* Assigned Vendors */}
          {event.assigned_vendors_count !== undefined && (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 text-slate-500 flex items-center justify-center">
                <span className="text-xs font-semibold">V</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Assigned Vendors</p>
                <p className="text-sm text-slate-600">
                  {event.assigned_vendors_count} vendor(s)
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-slate-700 mb-1">Description</p>
              <p className="text-sm text-slate-600">{event.description}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            Edit Event
          </Button>
          <Button onClick={handleViewDetails}>View Full Details</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
