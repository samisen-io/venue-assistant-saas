export type AnalyticsRange = {
  start: string
  end: string
}

export type MetricWithTrend = {
  value: number
  trend: number | null
}

export type AnalyticsOverview = {
  range: AnalyticsRange
  metrics: {
    page_views: MetricWithTrend
    chat_opened: MetricWithTrend
    leads_captured: MetricWithTrend
    cta_clicks: MetricWithTrend
  }
}
