"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

const EXAMPLE_QUERIES = [
  "Outdoor wedding in Austin for 200 guests",
  "Corporate conference with AV equipment in Dallas",
  "Intimate birthday party space with catering",
  "Rustic barn venue for a summer reception",
]

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function handleExampleClick(example: string) {
    router.push(`/search?q=${encodeURIComponent(example)}`)
  }

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Find Your Perfect{" "}
              <span className="text-blue-600">Event Venue</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-600 text-lg md:text-xl">
              Describe your dream event and we&apos;ll find the perfect venue.
              Powered by AI to understand exactly what you&apos;re looking for.
            </p>
          </div>

          {/* AI Search Input */}
          <form onSubmit={handleSearch} className="w-full max-w-3xl">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl border-2 border-gray-100 focus-within:border-blue-500 focus-within:shadow-blue-500/10 focus-within:shadow-2xl transition-all duration-300">
              <Sparkles className="ml-5 h-5 w-5 text-blue-500 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your perfect event venue..."
                className="flex-1 h-16 px-4 bg-transparent text-lg placeholder:text-gray-400 focus:outline-none"
              />
              <Button type="submit" size="lg" className="m-2 h-12 px-8 rounded-xl">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>

          {/* Example query pills */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
            <span className="text-sm text-gray-400 mr-1 self-center">Try:</span>
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-gray-500">
            <span>No account needed</span>
            <span className="hidden sm:inline">|</span>
            <span>AI-powered search</span>
            <span className="hidden sm:inline">|</span>
            <span>Connect directly with venues</span>
          </div>
        </div>
      </div>
    </section>
  )
}
