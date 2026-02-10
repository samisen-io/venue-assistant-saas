const STRIPE_ALLOWED_HOSTS = new Set([
  "checkout.stripe.com",
  "billing.stripe.com",
]);

export function getSafeRedirectUrl(rawUrl: unknown): string | null {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return null;

  try {
    const parsed = new URL(rawUrl, window.location.origin);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    if (!isHttp) return null;

    const isSameOrigin = parsed.origin === window.location.origin;
    const isAllowedStripeHost = STRIPE_ALLOWED_HOSTS.has(parsed.hostname);
    if (!isSameOrigin && !isAllowedStripeHost) return null;

    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeDisplayText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}
