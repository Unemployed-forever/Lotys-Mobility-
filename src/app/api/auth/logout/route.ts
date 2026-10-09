import { ADMIN_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return response;
}
