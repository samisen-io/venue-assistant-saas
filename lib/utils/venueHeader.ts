/**
 * Returns a headers object with X-Venue-Id set to the given venueId.
 * Returns an empty object when venueId is undefined, so the result is always
 * safe to spread into an existing headers object.
 *
 * @example
 * // Simple usage
 * const headers = withVenueHeader(activeVenue?.id)
 * fetch("/api/events", { headers })
 *
 * @example
 * // Merging with other headers
 * const headers = { "Content-Type": "application/json", ...withVenueHeader(activeVenue?.id) }
 */
export function withVenueHeader(venueId?: string): Record<string, string> {
  return venueId ? { "X-Venue-Id": venueId } : {}
}
