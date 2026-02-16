"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal, ArrowUpDown, Sparkles, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { VenueCard, MarketplaceVenueData } from "./VenueCard"
import { SearchFilters, SearchFilterValues } from "./SearchFilters"

type SearchResponse = {
  venues: MarketplaceVenueData[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

type ExtractedFilters = {
  location: string | null
  event_types: string[]
  venue_type: string | null
  min_guests: number | null
  amenities: string[]
  keywords: string[]
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Most Popular" },
  { value: "newest", label: "Recently Added" },
  { value: "capacity", label: "Largest Capacity" },
]

const emptyFilters: SearchFilterValues = {
  location: "",
  event_type: [],
  venue_type: "",
  guests: "",
  amenities: [],
}

export function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState(searchParams.get("sort") || "relevance")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // AI search state
  const [nlQuery, setNlQuery] = useState(searchParams.get("q") || "")
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [extractedFilters, setExtractedFilters] = useState<ExtractedFilters | null>(null)
  const initialLoadDone = useRef(false)

  // Initialize filters from URL
  const [filters, setFilters] = useState<SearchFilterValues>({
    location: searchParams.get("location") || "",
    event_type: searchParams.get("event_type")?.split(",").filter(Boolean) || [],
    venue_type: searchParams.get("venue_type") || "",
    guests: searchParams.get("guests") || "",
    amenities: searchParams.get("amenities")?.split(",").filter(Boolean) || [],
  })

  const currentPage = parseInt(searchParams.get("page") || "1", 10)

  // Build URL from current state
  const buildUrl = useCallback(
    (overrides: Partial<SearchFilterValues & { sort: string; page: number }> = {}) => {
      const params = new URLSearchParams()
      const f = { ...filters, ...overrides }

      if (f.location) params.set("location", f.location)
      if (f.event_type && f.event_type.length > 0) params.set("event_type", (f.event_type as string[]).join(","))
      if (f.venue_type) params.set("venue_type", f.venue_type as string)
      if (f.guests) params.set("guests", f.guests as string)
      if (f.amenities && f.amenities.length > 0) params.set("amenities", (f.amenities as string[]).join(","))

      const s = overrides.sort || sort
      if (s && s !== "relevance") params.set("sort", s)

      const p = overrides.page || currentPage
      if (p > 1) params.set("page", String(p))

      return `/search${params.toString() ? `?${params.toString()}` : ""}`
    },
    [filters, sort, currentPage]
  )

  // Standard filter-based search
  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.location) params.set("location", filters.location)
      if (filters.event_type.length > 0) params.set("event_type", filters.event_type.join(","))
      if (filters.venue_type) params.set("venue_type", filters.venue_type)
      if (filters.guests) params.set("guests", filters.guests)
      if (filters.amenities.length > 0) params.set("amenities", filters.amenities.join(","))
      if (sort) params.set("sort", sort)
      params.set("page", String(currentPage))

      const res = await fetch(`/api/public/venues/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [filters, sort, currentPage])

  // AI-powered search
  async function performAISearch(query: string) {
    setAiLoading(true)
    setLoading(true)
    setAiSummary(null)
    setExtractedFilters(null)
    try {
      const res = await fetch("/api/public/venues/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, page: 1 }),
      })
      if (res.ok) {
        const data = await res.json()
        setResults(data)
        setAiSummary(data.ai_summary || null)
        setExtractedFilters(data.extracted_filters || null)
        // Populate sidebar filters from AI extraction
        if (data.extracted_filters) {
          const ef = data.extracted_filters
          setFilters({
            location: ef.location || "",
            event_type: ef.event_types || [],
            venue_type: ef.venue_type || "",
            guests: ef.min_guests?.toString() || "",
            amenities: ef.amenities || [],
          })
        }
      } else {
        // AI failed — fall back to standard search
        await fetchResults()
      }
    } catch {
      await fetchResults()
    } finally {
      setAiLoading(false)
      setLoading(false)
    }
  }

  // Initial load: check for `q` param (AI) or run filter search
  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    const q = searchParams.get("q")
    if (q) {
      setNlQuery(q)
      performAISearch(q)
    } else {
      fetchResults()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-fetch when filters/sort/page change (but not on initial load)
  useEffect(() => {
    if (!initialLoadDone.current) return
    // Only run filter-based search if not in AI mode
    if (!searchParams.get("q")) {
      fetchResults()
    }
  }, [fetchResults, searchParams])

  function handleAISearch(e: React.FormEvent) {
    e.preventDefault()
    if (!nlQuery.trim()) return
    router.push(`/search?q=${encodeURIComponent(nlQuery.trim())}`)
    performAISearch(nlQuery.trim())
  }

  // When user manually adjusts filters, clear AI state and switch to filter mode
  function applyFilters(newFilters: SearchFilterValues) {
    setFilters(newFilters)
    setAiSummary(null)
    setExtractedFilters(null)
    router.push(buildUrl({ ...newFilters, page: 1 }))
  }

  function handleSortChange(newSort: string) {
    setSort(newSort)
    router.push(buildUrl({ sort: newSort, page: 1 }))
  }

  function handlePageChange(newPage: number) {
    router.push(buildUrl({ page: newPage }))
  }

  function clearFilters() {
    setFilters(emptyFilters)
    setAiSummary(null)
    setExtractedFilters(null)
    setNlQuery("")
    router.push("/search")
  }

  const total = results?.total || 0
  const totalPages = results?.total_pages || 1

  // Summary text (for filter mode)
  const summaryParts: string[] = []
  if (filters.location) summaryParts.push(`in "${filters.location}"`)
  if (filters.event_type.length > 0) summaryParts.push(`for ${filters.event_type.join(", ")}`)
  if (filters.guests) summaryParts.push(`${filters.guests}+ guests`)
  const summary = summaryParts.length > 0 ? summaryParts.join(" ") : ""

  return (
    <div>
      {/* AI Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleAISearch} className="relative max-w-2xl mx-auto">
          <div className="relative flex items-center bg-white rounded-xl border-2 border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md">
            <Sparkles className="ml-4 h-5 w-5 text-blue-500 flex-shrink-0" />
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="Describe your perfect event venue..."
              className="flex-1 h-14 px-3 bg-transparent text-lg placeholder:text-gray-400 focus:outline-none"
            />
            <Button
              type="submit"
              disabled={aiLoading || !nlQuery.trim()}
              className="m-1.5 h-11 px-6 rounded-lg"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-400 mt-2">
          Try: &quot;outdoor wedding venue in Austin for 200 guests&quot; or &quot;intimate corporate retreat with catering&quot;
        </p>
      </div>

      {/* AI Loading State */}
      {aiLoading && (
        <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-3 animate-pulse">
          <Sparkles className="h-5 w-5 text-blue-400" />
          <p className="text-blue-700">Understanding your search...</p>
        </div>
      )}

      {/* AI Summary Banner */}
      {aiSummary && !aiLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-900 font-medium">{aiSummary}</p>
            {extractedFilters && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {extractedFilters.location && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {extractedFilters.location}
                  </span>
                )}
                {extractedFilters.event_types.map((t) => (
                  <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {t}
                  </span>
                ))}
                {extractedFilters.min_guests && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {extractedFilters.min_guests}+ guests
                  </span>
                )}
                {extractedFilters.venue_type && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {extractedFilters.venue_type.replaceAll("_", " ")}
                  </span>
                )}
                {extractedFilters.keywords.map((k) => (
                  <span key={k} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 overflow-y-auto max-h-[calc(100vh-6rem)] pr-2">
            <SearchFilters
              filters={filters}
              onChange={applyFilters}
              onClear={clearFilters}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {loading ? "Searching..." : `${total} Venue${total !== 1 ? "s" : ""} Found`}
              </h1>
              {!aiSummary && summary && (
                <p className="text-sm text-gray-500 mt-1">
                  Showing results {summary}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <SearchFilters
                      filters={filters}
                      onChange={(f) => {
                        applyFilters(f)
                        setMobileFiltersOpen(false)
                      }}
                      onClear={() => {
                        clearFilters()
                        setMobileFiltersOpen(false)
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : results && results.venues.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.venues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500 px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">No venues found</div>
              <p className="text-gray-500 mb-6">
                Try adjusting your search criteria or browse all venues.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
