'use client'

import { use, useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { DateRangeSelector } from '@/components/analytics/DateRangeSelector'
import { AnalyticsMetricCard } from '@/components/analytics/AnalyticsMetricCard'
import { InquiryAnalytics } from '@/components/analytics/InquiryAnalytics'
import { AIChatPerformance } from '@/components/analytics/AIChatPerformance'
import { VisitorBehavior } from '@/components/analytics/VisitorBehavior'
import { TrafficSourcesChart } from '@/components/analytics/AnalyticsChart'
import { Loading } from '@/components/shared/Loading'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { Eye, MessageCircle, Users, BarChart3 } from 'lucide-react'

interface PageProps {
  params: Promise<{ venueId: string }>
}

export default function AnalyticsDashboard({ params }: PageProps) {
  const resolvedParams = use(params)
  const [range, setRange] = useState('30d')
  const [customStart, setCustomStart] = useState<string>()
  const [customEnd, setCustomEnd] = useState<string>()

  const { data: analytics, loading, error } = useAnalytics(
    resolvedParams.venueId,
    range,
    customStart,
    customEnd
  )

  if (loading) return <Loading />

  if (error) {
    return <ErrorMessage message={error} title="Analytics Error" />
  }

  if (!analytics) {
    return (
      <ErrorMessage message="No analytics data available" title="No Data" />
    )
  }

  const { metrics } = analytics
  const chatOpenRate = metrics.page_views.value > 0
    ? ((metrics.chat_opened.value / metrics.page_views.value) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your venue page performance and lead generation metrics
        </p>
      </div>

      <DateRangeSelector
        defaultRange={range as any}
        onRangeChange={setRange}
        onCustomDatesChange={(s, e) => {
          setCustomStart(s)
          setCustomEnd(e)
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsMetricCard
          label="Page Views"
          value={metrics.page_views.value}
          trend={metrics.page_views.trend}
          icon={<Eye className="h-6 w-6 text-blue-600" />}
        />
        <AnalyticsMetricCard
          label="Chat Opened"
          value={metrics.chat_opened.value}
          trend={metrics.chat_opened.trend}
          icon={<MessageCircle className="h-6 w-6 text-purple-600" />}
          format={(v) => `${v} (${chatOpenRate}%)`}
        />
        <AnalyticsMetricCard
          label="Leads Captured"
          value={metrics.leads_captured.value}
          trend={metrics.leads_captured.trend}
          icon={<Users className="h-6 w-6 text-green-600" />}
        />
        <AnalyticsMetricCard
          label="CTA Clicks"
          value={metrics.cta_clicks.value}
          trend={metrics.cta_clicks.trend}
          icon={<BarChart3 className="h-6 w-6 text-orange-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InquiryAnalytics metrics={metrics} />
        </div>
        <div className="space-y-6">
          <TrafficSourcesChart />
          <AIChatPerformance
            chatOpened={metrics.chat_opened.value}
            leadsFromChat={metrics.leads_captured.value}
          />
        </div>
      </div>

      <VisitorBehavior />

      <div className="text-xs text-muted-foreground text-center py-4">
        Data updated in real-time. Last 12 months of data available.
      </div>
    </div>
  )
}
