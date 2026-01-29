"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "28rem",
            }}
          >
            <div
              style={{
                width: "4rem",
                height: "4rem",
                borderRadius: "50%",
                backgroundColor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>

            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#111827",
              }}
            >
              Critical Error
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginBottom: "1.5rem",
              }}
            >
              A critical error occurred. We apologize for the inconvenience.
              Please try refreshing the page.
            </p>

            {error.digest && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  fontFamily: "monospace",
                  backgroundColor: "#f3f4f6",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  marginBottom: "1.5rem",
                }}
              >
                Error ID: {error.digest}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={reset}
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                Try Again
              </button>

              <a
                href="/"
                style={{
                  backgroundColor: "white",
                  color: "#374151",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  textDecoration: "none",
                }}
              >
                Go Home
              </a>
            </div>

            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "1.5rem",
              }}
            >
              Need help?{" "}
              <a
                href="mailto:support@venuemanager.com"
                style={{ color: "#2563eb", textDecoration: "underline" }}
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
