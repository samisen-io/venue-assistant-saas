"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

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
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Something went wrong
            </h1>
            <p className="text-muted-foreground">
              We encountered an unexpected error. Our team has been notified and
              is working to fix the issue.
            </p>
          </div>

          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-2 rounded">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            If the problem persists,{" "}
            <Link
              href="mailto:support@venuemanager.com"
              className="text-primary hover:underline"
            >
              contact support
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
