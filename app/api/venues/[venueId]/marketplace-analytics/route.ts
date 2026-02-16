/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { venueId } = await params
    const { searchParams } = request.nextUrl
    const days = parseInt(searchParams.get("days") || "30", 10)

    // Verify ownership
    const { data: venue } = await (supabase as any)
      .from("venues")
      .select("id, owner_id, view_count, inquiry_count")
      .eq("id", venueId)
      .eq("owner_id", user.id)
      .single()

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString()

    // Fetch views in period
    const { count: viewsCount } = await (supabase as any)
      .from("venue_page_views")
      .select("id", { count: "exact", head: true })
      .eq("venue_id", venueId)
      .gte("created_at", sinceStr)

    // Fetch inquiries in period
    const { count: inquiriesCount } = await (supabase as any)
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("venue_id", venueId)
      .eq("source", "public_inquiry")
      .gte("created_at", sinceStr)

    // Fetch views by day
    const { data: viewsByDay } = await (supabase as any)
      .from("venue_page_views")
      .select("created_at")
      .eq("venue_id", venueId)
      .gte("created_at", sinceStr)
      .order("created_at", { ascending: true })

    // Group views by day
    const dayMap: Record<string, number> = {}
    for (const view of viewsByDay || []) {
      const day = view.created_at.split("T")[0]
      dayMap[day] = (dayMap[day] || 0) + 1
    }
    const viewsByDayArr = Object.entries(dayMap).map(([date, count]) => ({
      date,
      count,
    }))

    // Fetch top referral sources
    const { data: viewsWithReferrer } = await (supabase as any)
      .from("venue_page_views")
      .select("source")
      .eq("venue_id", venueId)
      .gte("created_at", sinceStr)

    const sourceMap: Record<string, number> = {}
    for (const v of viewsWithReferrer || []) {
      const src = v.source || "direct"
      sourceMap[src] = (sourceMap[src] || 0) + 1
    }
    const topSources = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Fetch top search keywords that led to this venue
    const { data: searchQueries } = await (supabase as any)
      .from("venue_search_queries")
      .select("query_text, location, event_type")
      .gte("created_at", sinceStr)
      .not("query_text", "is", null)
      .limit(100)

    const keywordMap: Record<string, number> = {}
    for (const q of searchQueries || []) {
      const keyword = q.query_text || q.location || q.event_type
      if (keyword) {
        keywordMap[keyword] = (keywordMap[keyword] || 0) + 1
      }
    }
    const topKeywords = Object.entries(keywordMap)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate conversion rate
    const views = viewsCount || 0
    const inquiries = inquiriesCount || 0
    const conversionRate = views > 0 ? (inquiries / views) * 100 : 0

    return NextResponse.json({
      range: { days, since: sinceStr },
      metrics: {
        total_views: venue.view_count || 0,
        total_inquiries: venue.inquiry_count || 0,
        period_views: views,
        period_inquiries: inquiries,
        conversion_rate: Math.round(conversionRate * 100) / 100,
      },
      views_by_day: viewsByDayArr,
      top_referral_sources: topSources,
      top_search_keywords: topKeywords,
    })
  } catch (error) {
    console.error("Marketplace analytics error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
