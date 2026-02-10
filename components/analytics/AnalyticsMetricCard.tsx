'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AnalyticsMetricCardProps {
  label: string
  value: number
  trend?: number | null
  trendLabel?: string
  icon?: React.ReactNode
  format?: (val: number) => string
}

export function AnalyticsMetricCard({
  label,
  value,
  trend,
  trendLabel = 'vs last period',
  icon,
  format = (v) => v.toString(),
}: AnalyticsMetricCardProps) {
  const isPositive = trend !== null && trend !== undefined && trend >= 0
  const trendAbs = trend !== null && trend !== undefined ? Math.abs(trend).toFixed(1) : null

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold">{format(value)}</p>
          
          {trendAbs !== null && (
            <div className="mt-3 flex items-center gap-2">
              {isPositive ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={cn('text-sm font-medium', {
                  'text-green-600': isPositive,
                  'text-red-600': !isPositive,
                })}
              >
                {trendAbs}%
              </span>
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            </div>
          )}
        </div>
        {icon && <div className="flex-shrink-0">{icon}</div>}
      </div>
    </Card>
  )
}
