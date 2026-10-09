import { createAdminSessionToken, isAdminAuthConfigured, isTotpEnabled, verifyAdminPassword, verifyAdminTotp, ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE } from "@/lib/auth";
import { checkRateLimit, requestIpKey, tooManyRequests } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return Response.json(
      { error: "Admin-Zugang ist noch nicht konfiguriert. Bitte ADMIN_PASSWORD und einen mindestens 32 Zeichen langen SESSION_SECRET setzen." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const limit = checkRateLimit(`admin-login:${requestIpKey(request)}`, 8, 15 * 60 * 1000);
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  let body: { password?: unknown; totp?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password || password.length > 512 || !verifyAdminPassword(password)) {
    return Response.json({ error: "Passwort ist nicht korrekt." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (isTotpEnabled() && !verifyAdminTotp(typeof body.totp === "string" ? body.totp : "")) {
    return Response.json({ error: "Authenticator-Code ist nicht korrekt." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const token = createAdminSessionToken();
  if (!token) {
    return Response.json({ error: "Die Session-Konfiguration ist ungültig." }, { status: 503 });
  }

  const response = Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=${token}; Path=/; Max-Age=${ADMIN_SESSION_MAX_AGE}; HttpOnly; SameSite=Strict${secure}`,
  );
  return response;
}
