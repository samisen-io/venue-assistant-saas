'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { useState } from 'react'

interface DateRangeSelectorProps {
  onRangeChange: (range: string) => void
  onCustomDatesChange?: (start: string, end: string) => void
  defaultRange?: '7d' | '30d' | '90d'
}

export function DateRangeSelector({
  onRangeChange,
  onCustomDatesChange,
  defaultRange = '30d',
}: DateRangeSelectorProps) {
  const [activeRange, setActiveRange] = useState<string>(defaultRange)
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const handleRangeClick = (range: string) => {
    setActiveRange(range)
    setShowCustom(false)
    onRangeChange(range)
  }

  const handleCustomApply = () => {
    if (customStart && customEnd && onCustomDatesChange) {
      onCustomDatesChange(customStart, customEnd)
      setActiveRange('custom')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeRange === '7d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRangeClick('7d')}
        >
          Last 7 days
        </Button>
        <Button
          variant={activeRange === '30d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRangeClick('30d')}
        >
          Last 30 days
        </Button>
        <Button
          variant={activeRange === '90d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRangeClick('90d')}
        >
          Last 90 days
        </Button>
        <Button
          variant={activeRange === 'custom' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowCustom(!showCustom)}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Custom
        </Button>
      </div>

      {showCustom && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground">Start date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground">End date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <Button size="sm" onClick={handleCustomApply}>
            Apply
          </Button>
        </div>
      )}
    </div>
  )
}
