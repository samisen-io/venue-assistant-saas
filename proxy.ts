import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Simple in-memory rate limiter for middleware
 * Note: This works for single-instance deployments.
 * For production with multiple instances, consider using Vercel KV or Upstash Redis.
 */
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute for general API
const MAX_AUTH_REQUESTS_PER_WINDOW = 10; // 10 requests per minute for auth

function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Use a combination of headers as fallback
  const userAgent = request.headers.get("user-agent") || "unknown";
  return `ua:${userAgent.substring(0, 50)}`;
}

function checkRateLimit(
  identifier: string,
  maxRequests: number
): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const key = identifier;

  const entry = rateLimitMap.get(key);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now - v.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.delete(k);
      }
    }
  }

  if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
    // New window
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      reset: now + RATE_LIMIT_WINDOW,
    };
  }

  // Within window
  entry.count += 1;

  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      reset: entry.timestamp + RATE_LIMIT_WINDOW,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    reset: entry.timestamp + RATE_LIMIT_WINDOW,
  };
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for webhook endpoints (they have their own auth)
  if (pathname.startsWith("/api/webhooks/")) {
    return NextResponse.next();
  }

  // Skip middleware for cron endpoints (they use cron secret)
  if (pathname.startsWith("/api/cron/")) {
    return NextResponse.next();
  }

  // Skip rate limiting in development/test to avoid hitting limits during local dev and E2E tests
  if (process.env.NODE_ENV !== "production") {
    return await updateSession(request);
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith("/api/")) {
    const clientId = getClientIdentifier(request);

    // Determine rate limit based on route
    let maxRequests = MAX_REQUESTS_PER_WINDOW;
    let limitKey = `api:${clientId}`;

    if (pathname.startsWith("/api/auth/")) {
      maxRequests = MAX_AUTH_REQUESTS_PER_WINDOW;
      limitKey = `auth:${clientId}`;
    } else if (pathname.startsWith("/api/ai/")) {
      maxRequests = 20; // AI routes are expensive
      limitKey = `ai:${clientId}`;
    } else if (pathname.startsWith("/api/seed")) {
      maxRequests = 5; // Seed route should be rarely used
      limitKey = `seed:${clientId}`;
    }

    const rateLimit = checkRateLimit(limitKey, maxRequests);

    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.reset.toString(),
            "Retry-After": Math.ceil(
              (rateLimit.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Continue with rate limit headers
    const response = await updateSession(request);

    if (response) {
      response.headers.set("X-RateLimit-Limit", maxRequests.toString());
      response.headers.set(
        "X-RateLimit-Remaining",
        rateLimit.remaining.toString()
      );
      response.headers.set("X-RateLimit-Reset", rateLimit.reset.toString());
      return response;
    }

    // If updateSession returns undefined, create a new response with headers
    const nextResponse = NextResponse.next();
    nextResponse.headers.set("X-RateLimit-Limit", maxRequests.toString());
    nextResponse.headers.set(
      "X-RateLimit-Remaining",
      rateLimit.remaining.toString()
    );
    nextResponse.headers.set("X-RateLimit-Reset", rateLimit.reset.toString());
    return nextResponse;
  }

  // For non-API routes, just handle session
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets
     */
    String.raw`/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)`,
  ],
};
