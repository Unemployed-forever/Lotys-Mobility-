import { NextRequest } from "next/server";
import { db } from "@/db";
import { customerAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit, requestIpKey, tooManyRequests } from "@/lib/rate-limit";
import { createCustomerToken, CUSTOMER_COOKIE, CUSTOMER_MAX_AGE, verifyCustomerPassword } from "@/lib/customer-auth";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`customer-login:${requestIpKey(request)}`, 8, 15 * 60 * 1000);
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Ungültige Anfrage." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password || password.length > 200) return Response.json({ error: "Anmeldung nicht möglich. Bitte Zugangsdaten prüfen." }, { status: 401 });
  const [account] = await db.select().from(customerAccounts).where(eq(customerAccounts.email, email)).limit(1);
  if (!account || !account.approved || !verifyCustomerPassword(password, account.passwordHash)) return Response.json({ error: "Anmeldung nicht möglich. Bitte Zugangsdaten prüfen." }, { status: 401 });
  const token = createCustomerToken(account.id);
  if (!token) return Response.json({ error: "Zugang vorübergehend nicht verfügbar." }, { status: 503 });
  const response = Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.headers.append("Set-Cookie", `${CUSTOMER_COOKIE}=${token}; Path=/; Max-Age=${CUSTOMER_MAX_AGE}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  return response;
}
