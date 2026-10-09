import { CUSTOMER_COOKIE } from "@/lib/customer-auth";
export async function POST() {
  const response = Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.headers.append("Set-Cookie", `${CUSTOMER_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  return response;
}
