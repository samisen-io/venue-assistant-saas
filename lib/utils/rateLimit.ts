/**
 * Simple in-memory rate limiter for API routes
 * For production with multiple instances, consider using Redis or Upstash
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

// Start cleanup on module load
if (typeof window === "undefined") {
  startCleanup();
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Identifier prefix for the rate limit key */
  identifier?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const { limit, windowSeconds } = config;
  const key = config.identifier ? `${config.identifier}:${identifier}` : identifier;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const entry = rateLimitStore.get(key);

  // If no entry or entry has expired, create new one
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      remaining: limit - 1,
      reset: resetTime,
      limit,
    };
  }

  // Increment count
  entry.count += 1;

  // Check if over limit
  if (entry.count > limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
      limit,
    };
  }

  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetTime,
    limit,
  };
}

/**
 * Get IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Check various headers for IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback
  return "unknown";
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    }
  );
}

/**
 * Preset configurations for different API routes
 */
export const RATE_LIMITS = {
  // General API routes: 100 requests per minute
  api: {
    limit: 100,
    windowSeconds: 60,
    identifier: "api",
  },

  // Auth routes: 10 requests per minute (stricter for security)
  auth: {
    limit: 10,
    windowSeconds: 60,
    identifier: "auth",
  },

  // AI routes: 20 requests per minute (expensive operations)
  ai: {
    limit: 20,
    windowSeconds: 60,
    identifier: "ai",
  },

  // Webhook routes: 100 requests per minute
  webhook: {
    limit: 100,
    windowSeconds: 60,
    identifier: "webhook",
  },

  // Seed route: 5 requests per minute
  seed: {
    limit: 5,
    windowSeconds: 60,
    identifier: "seed",
  },
} as const;

/**
 * Higher-order function to wrap an API route with rate limiting
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  config: RateLimitConfig = RATE_LIMITS.api
) {
  return async (request: Request): Promise<Response> => {
    const ip = getClientIp(request);
    const result = checkRateLimit(ip, config);

    if (!result.success) {
      return rateLimitResponse(result);
    }

    // Add rate limit headers to successful response
    const response = await handler(request);

    // Clone response to add headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-RateLimit-Limit", result.limit.toString());
    newHeaders.set("X-RateLimit-Remaining", result.remaining.toString());
    newHeaders.set("X-RateLimit-Reset", result.reset.toString());

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}
