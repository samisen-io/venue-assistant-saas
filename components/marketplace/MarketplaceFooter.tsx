import Link from "next/link"
import { Building2 } from "lucide-react"

export function MarketplaceFooter() {
  return (
    <footer className="w-full py-12 bg-gray-900 text-gray-400">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-white mb-4">
              <Building2 className="h-6 w-6" />
              <span className="font-bold">VenueManager</span>
            </div>
            <p className="text-sm">
              Discover and book amazing event venues. Connect directly with
              venue managers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Browse Venues</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  All Venues
                </Link>
              </li>
              <li>
                <Link
                  href="/search?event_type=wedding"
                  className="hover:text-white transition-colors"
                >
                  Wedding Venues
                </Link>
              </li>
              <li>
                <Link
                  href="/search?event_type=corporate"
                  className="hover:text-white transition-colors"
                >
                  Corporate Event Venues
                </Link>
              </li>
              <li>
                <Link
                  href="/search?event_type=party"
                  className="hover:text-white transition-colors"
                >
                  Party Venues
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Popular Cities</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/search?location=Dallas"
                  className="hover:text-white transition-colors"
                >
                  Dallas
                </Link>
              </li>
              <li>
                <Link
                  href="/search?location=Austin"
                  className="hover:text-white transition-colors"
                >
                  Austin
                </Link>
              </li>
              <li>
                <Link
                  href="/search?location=Houston"
                  className="hover:text-white transition-colors"
                >
                  Houston
                </Link>
              </li>
              <li>
                <Link
                  href="/search?location=San+Antonio"
                  className="hover:text-white transition-colors"
                >
                  San Antonio
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">For Venues</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/for-venues"
                  className="hover:text-white transition-colors"
                >
                  List Your Venue
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors"
                >
                  Manager Login
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} VenueManager. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
