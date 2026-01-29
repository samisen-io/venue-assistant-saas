import Link from "next/link";
import { Building2 } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link className="flex items-center justify-center" href="/">
            <Building2 className="h-6 w-6 mr-2 text-blue-600" />
            <span className="font-bold">VenueManager</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              href="/privacy"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              href="/terms"
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
          {children}
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} VenueManager. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="mailto:support@venuemanager.com" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
