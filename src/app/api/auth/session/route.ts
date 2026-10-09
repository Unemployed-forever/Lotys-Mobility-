import { isAdminAuthConfigured, isAdminRequest, isTotpEnabled } from "@/lib/auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return Response.json(
    { authenticated: isAdminRequest(request), configured: isAdminAuthConfigured(), totpEnabled: isTotpEnabled() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
