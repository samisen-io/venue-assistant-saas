"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, MessageSquare, TrendingUp, Search } from "lucide-react"

type AnalyticsData = {
  range: { days: number; since: string }
  metrics: {
    total_views: number
    total_inquiries: number
    period_views: number
    period_inquiries: number
    conversion_rate: number
  }
  views_by_day: Array<{ date: string; count: number }>
  top_referral_sources: Array<{ source: string; count: number }>
  top_search_keywords: Array<{ keyword: string; count: number }>
}

export function MarketplaceAnalytics({ venueId }: { venueId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState("30")

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/venues/${venueId}/marketplace-analytics?days=${days}`
      )
      if (res.ok) {
        setData(await res.json())
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [venueId, days])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const { metrics } = data

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Marketplace Performance</h2>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.period_views}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.total_views} all time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.period_inquiries}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.total_inquiries} all time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversion_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Views to inquiries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Search Keywords
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.top_search_keywords.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique search terms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Referral Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.top_referral_sources.length > 0 ? (
              <div className="space-y-3">
                {data.top_referral_sources.map((source) => (
                  <div
                    key={source.source}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm capitalize">{source.source.replace(/_/g, " ")}</span>
                    <span className="text-sm font-medium">{source.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No traffic data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Search Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Top Search Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.top_search_keywords.length > 0 ? (
              <div className="space-y-3">
                {data.top_search_keywords.slice(0, 5).map((kw) => (
                  <div
                    key={kw.keyword}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{kw.keyword}</span>
                    <span className="text-sm font-medium">{kw.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No search data yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
