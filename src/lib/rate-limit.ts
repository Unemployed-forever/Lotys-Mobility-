import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Process-local fallback limiter. Use an edge/WAF or shared Redis limiter
 * when deploying more than one application instance.
 */
export function checkRateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const current = buckets.get(key);

  if (buckets.size > 5000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
    if (buckets.size > 5000) buckets.delete(buckets.keys().next().value ?? "");
  }

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, retryAfterSeconds: 0 };
}

export function requestIpKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = request.headers.get("x-real-ip")?.trim() || forwardedFor || "unknown";
  return ip.slice(0, 100);
}

export function tooManyRequests(retryAfterSeconds: number) {
  return Response.json(
    { error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds), "Cache-Control": "no-store" } },
  );
}
