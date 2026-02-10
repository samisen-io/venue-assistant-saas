'use client'

import { Card } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'

interface AIChatPerformanceProps {
  chatOpened: number
  leadsFromChat: number
}

export function AIChatPerformance({ chatOpened, leadsFromChat }: AIChatPerformanceProps) {
  const conversionRate = chatOpened > 0 ? ((leadsFromChat / chatOpened) * 100).toFixed(1) : '0'

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">AI Chat Performance</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Conversations Started</p>
          <p className="text-2xl font-bold">{chatOpened}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Lead Conversion Rate</p>
          <p className="text-2xl font-bold">{conversionRate}%</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
        <p>
          Out of {chatOpened} conversations, {leadsFromChat} resulted in captured leads
        </p>
      </div>
    </Card>
  )
}
