'use client'

import { Card } from '@/components/ui/card'
import { Eye } from 'lucide-react'

interface VisitorBehaviorProps {
  avgTimeOnPage?: number
  scrollDepth?: { section: string; percentage: number }[]
  mostClickedElements?: { element: string; clicks: number }[]
}

export function VisitorBehavior({
  avgTimeOnPage = 0,
  scrollDepth = [],
  mostClickedElements = [],
}: VisitorBehaviorProps) {
  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Visitor Behavior</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Average Time on Page</p>
            <p className="text-2xl font-bold">{formatSeconds(avgTimeOnPage)}</p>
          </div>

          {scrollDepth.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Scroll Depth by Section</p>
              <div className="space-y-2">
                {scrollDepth.map((item) => (
                  <div key={item.section}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.section}</span>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mostClickedElements.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Most Clicked Elements</p>
              <div className="space-y-2">
                {mostClickedElements.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate pr-2">{item.element}</span>
                    <span className="font-medium whitespace-nowrap">{item.clicks} clicks</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
