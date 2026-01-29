import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <Building2 className="h-6 w-6 mr-2 text-blue-600" />
          <span className="font-bold">VenueManager</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-7xl font-bold text-blue-600">404</h1>
            <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
            <p className="text-muted-foreground">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
              It might have been moved or doesn&apos;t exist.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="mailto:support@venuemanager.com" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
