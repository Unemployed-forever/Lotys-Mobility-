import { NextRequest, NextResponse } from "next/server";

/**
 * Same-origin enforcement for all state-changing API calls (CSRF defence in depth).
 * Session cookies are SameSite, but this blocks cross-site form posts even in
 * older browsers. Requests without Origin/Referer (curl, server-to-server) pass,
 * since they cannot carry the victim's cookies from a foreign website anyway.
 */
export function middleware(request: NextRequest) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return NextResponse.next();
  }
  const host = request.headers.get("host") ?? "";
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const candidate = origin ?? referer;
  if (candidate) {
    try {
      if (new URL(candidate).host !== host) {
        return NextResponse.json({ error: "Ungültige Anfragequelle." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragequelle." }, { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
