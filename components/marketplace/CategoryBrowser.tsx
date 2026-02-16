import Link from "next/link"
import {
  Heart,
  Building2,
  PartyPopper,
  Briefcase,
  Sparkles,
  Mic2,
  MapPin,
} from "lucide-react"

const eventCategories = [
  { label: "Wedding", value: "wedding", icon: Heart, color: "bg-pink-100 text-pink-600" },
  { label: "Corporate", value: "corporate", icon: Briefcase, color: "bg-blue-100 text-blue-600" },
  { label: "Party", value: "party", icon: PartyPopper, color: "bg-purple-100 text-purple-600" },
  { label: "Conference", value: "conference", icon: Mic2, color: "bg-green-100 text-green-600" },
  { label: "Gala", value: "gala", icon: Sparkles, color: "bg-amber-100 text-amber-600" },
  { label: "Meeting", value: "meeting", icon: Building2, color: "bg-cyan-100 text-cyan-600" },
]

const popularCities = [
  { label: "Dallas", value: "Dallas" },
  { label: "Austin", value: "Austin" },
  { label: "Houston", value: "Houston" },
  { label: "San Antonio", value: "San Antonio" },
  { label: "Fort Worth", value: "Fort Worth" },
  { label: "Fredericksburg", value: "Fredericksburg" },
]

export function CategoryBrowser() {
  return (
    <section className="w-full py-16 md:py-24 bg-gray-50">
      <div className="container px-4 md:px-6">
        {/* Browse by Event Type */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-4">
            Browse by Event Type
          </h2>
          <p className="text-gray-500 text-lg text-center mb-10 max-w-[600px] mx-auto">
            Find the perfect venue for any occasion
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {eventCategories.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.value}
                  href={`/venues?event_type=${cat.value}`}
                  className="group flex flex-col items-center gap-3 rounded-xl bg-white p-6 border hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className={`h-14 w-14 rounded-full ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                    {cat.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Browse by City */}
        <div>
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl text-center mb-4">
            Popular Cities
          </h2>
          <p className="text-gray-500 text-center mb-8 max-w-[500px] mx-auto">
            Explore venues in top Texas cities
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularCities.map((city) => (
              <Link
                key={city.value}
                href={`/venues?location=${encodeURIComponent(city.value)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all"
              >
                <MapPin className="h-3.5 w-3.5" />
                {city.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
