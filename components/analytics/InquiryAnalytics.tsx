'use client'

import { Card } from '@/components/ui/card'
import { AnalyticsMetricCard } from './AnalyticsMetricCard'
import type { MetricWithTrend } from '@/lib/types/analytics.types'

interface InquiryAnalyticsProps {
  metrics: {
    page_views: MetricWithTrend
    chat_opened: MetricWithTrend
    leads_captured: MetricWithTrend
    cta_clicks: MetricWithTrend
  }
}

export function InquiryAnalytics({ metrics }: InquiryAnalyticsProps) {
  const conversionRate = metrics.page_views.value > 0 
    ? ((metrics.leads_captured.value / metrics.page_views.value) * 100).toFixed(1)
    : '0'

  const chatOpenRate = metrics.page_views.value > 0
    ? ((metrics.chat_opened.value / metrics.page_views.value) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Inquiry Conversion Funnel</h3>
        <div className="grid grid-cols-1 gap-4">
          <AnalyticsMetricCard
            label="Page Views"
            value={metrics.page_views.value}
            trend={metrics.page_views.trend}
            trendLabel="vs last period"
          />
          <AnalyticsMetricCard
            label="Chat Opened"
            value={metrics.chat_opened.value}
            trend={metrics.chat_opened.trend}
            format={(v) => `${v} (${((v / Math.max(metrics.page_views.value, 1)) * 100).toFixed(1)}%)`}
          />
          <AnalyticsMetricCard
            label="Leads Captured"
            value={metrics.leads_captured.value}
            trend={metrics.leads_captured.trend}
            format={(v) => `${v} (${conversionRate}% of views)`}
          />
        </div>
      </div>

      <Card className="p-6">
        <h4 className="font-medium mb-4">Funnel Metrics</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Views → Chat</span>
            <span className="font-medium">{chatOpenRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Chat → Lead</span>
            <span className="font-medium">
              {metrics.chat_opened.value > 0
                ? ((metrics.leads_captured.value / metrics.chat_opened.value) * 100).toFixed(1)
                : '0'}
              %
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Views → Lead</span>
            <span className="font-medium">{conversionRate}%</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
