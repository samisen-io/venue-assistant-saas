'use client'

import { Card } from '@/components/ui/card'
import { Globe } from 'lucide-react'

interface TrafficSourcesChartProps {
  sources?: { source: string; count: number }[]
}

export function TrafficSourcesChart({ sources = [] }: TrafficSourcesChartProps) {
  const totalTraffic = sources.reduce((sum, item) => sum + item.count, 0)

  // Default sources if none provided
  const displaySources = sources.length > 0 ? sources : [
    { source: 'Direct', count: 0 },
    { source: 'Google', count: 0 },
    { source: 'Other', count: 0 },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Traffic Sources</h3>
      </div>

      <div className="space-y-3">
        {displaySources.map((item) => {
          const percentage = totalTraffic > 0 ? (item.count / totalTraffic) * 100 : 0
          return (
            <div key={item.source}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  {item.source || 'Unknown'}
                </span>
                <span className="font-medium">
                  {item.count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {totalTraffic === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No traffic data available yet
        </div>
      )}
    </Card>
  )
}
