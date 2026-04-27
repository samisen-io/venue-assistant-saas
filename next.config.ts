import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // DENY is safer — this SaaS never embeds itself inside an iframe
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-eval' required by React/Turbopack in dev; omitted in production.
      // 'unsafe-inline' kept for now (required by Tailwind/shadcn inline styles injected by React);
      // replace with a per-request nonce once Next.js nonce support stabilises.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.resend.com https://api.stripe.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Security headers for all routes
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Strict mode for React
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Enable server actions (already enabled by default in Next.js 14+)
  },
};

export default nextConfig;
