'use client'

import { Plus, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EventStatus } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface CalendarToolbarProps {
  selectedStatuses?: EventStatus[]
  onStatusChange?: (statuses: EventStatus[]) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  showLegend?: boolean
}

const statusConfig: Record<EventStatus, { label: string; color: string }> = {
  planning: { label: 'Planning', color: 'bg-slate-200 text-slate-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-600' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-800 border-amber-600' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-600' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-600' },
}

export function CalendarToolbar({
  selectedStatuses = [],
  onStatusChange,
  searchQuery = '',
  onSearchChange,
  showLegend = true,
}: CalendarToolbarProps) {
  const router = useRouter()

  const toggleStatus = (status: EventStatus) => {
    if (!onStatusChange) return

    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status))
    } else {
      onStatusChange([...selectedStatuses, status])
    }
  }

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side - Search and filters */}
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status filters */}
          {onStatusChange && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-600" />
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant={selectedStatuses.length === 0 ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    selectedStatuses.length === 0
                      ? 'bg-slate-800 text-white'
                      : 'hover:bg-slate-100'
                  }`}
                  onClick={() => onStatusChange([])}
                >
                  All
                </Badge>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <Badge
                    key={status}
                    variant={selectedStatuses.includes(status as EventStatus) ? 'default' : 'outline'}
                    className={`cursor-pointer ${
                      selectedStatuses.includes(status as EventStatus)
                        ? config.color + ' border'
                        : 'hover:bg-slate-100'
                    }`}
                    onClick={() => toggleStatus(status as EventStatus)}
                  >
                    {config.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push('/events/new')} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Event
          </Button>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-slate-700">Status Legend:</span>
            {Object.entries(statusConfig).map(([status, config]) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-sm ${config.color} border`}
                  style={{
                    borderLeftWidth: '4px',
                  }}
                />
                <span className="text-xs text-slate-600">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
