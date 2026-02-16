import Link from "next/link"
import { MapPin, Users, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export type MarketplaceVenueData = {
  id: string
  name: string
  slug: string | null
  city: string | null
  state: string | null
  venue_type: string | null
  tagline: string | null
  hero_image_url: string | null
  capacity: number | null
  view_count: number | null
  event_types: string[]
  starting_price: number | null
}

function formatVenueType(type: string | null) {
  if (!type) return null
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatPrice(price: number | null) {
  if (!price) return "Request Quote"
  return `From $${price.toLocaleString()}`
}

export function VenueCard({ venue }: { venue: MarketplaceVenueData }) {
  const href = venue.slug ? `/${venue.slug}` : "#"

  return (
    <Link href={href} className="group block">
      <Card className="overflow-hidden border hover:border-blue-200 hover:shadow-lg transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
          {venue.hero_image_url ? (
            <img
              src={venue.hero_image_url}
              alt={venue.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-4xl text-blue-300/60">
                {venue.name.charAt(0)}
              </span>
            </div>
          )}
          {venue.venue_type && (
            <Badge className="absolute top-3 left-3 bg-white/90 text-gray-700 hover:bg-white/90 backdrop-blur-sm">
              {formatVenueType(venue.venue_type)}
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-2">
          {/* Name & Tagline */}
          <h3 className="font-semibold text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
            {venue.name}
          </h3>
          {venue.tagline && (
            <p className="text-sm text-gray-500 line-clamp-1">{venue.tagline}</p>
          )}

          {/* Location & Capacity */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {(venue.city || venue.state) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {[venue.city, venue.state].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
            {venue.capacity && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>Up to {venue.capacity}</span>
              </div>
            )}
          </div>

          {/* Event Types */}
          {venue.event_types.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {venue.event_types.slice(0, 3).map((type) => (
                <Badge key={type} variant="secondary" className="text-xs font-normal">
                  {type}
                </Badge>
              ))}
              {venue.event_types.length > 3 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  +{venue.event_types.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Price & Views */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold text-blue-600">
              {formatPrice(venue.starting_price)}
            </span>
            {venue.view_count && venue.view_count > 0 ? (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Eye className="h-3 w-3" />
                <span>{venue.view_count}</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
