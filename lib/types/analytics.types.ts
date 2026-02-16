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

export type MarketplaceAnalytics = {
  range: AnalyticsRange
  metrics: {
    marketplace_views: MetricWithTrend
    marketplace_inquiries: MetricWithTrend
    conversion_rate: MetricWithTrend
    search_appearances: MetricWithTrend
  }
  top_search_keywords: Array<{ keyword: string; count: number }>
  top_referral_sources: Array<{ source: string; count: number }>
  views_by_day: Array<{ date: string; count: number }>
}
