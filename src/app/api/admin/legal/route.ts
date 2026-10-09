import { NextRequest } from "next/server";
import { db } from "@/db";
import { legalSettings } from "@/db/schema";
import { isAdminRequest } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { getLegalSettings, isLegalReady } from "@/lib/legal";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
const keys = ["businessName", "legalForm", "street", "postalCode", "city", "country", "email", "phone", "representative", "registryCourt", "registryNumber", "vatId", "editorialResponsible", "hostingProvider", "hostingLocation", "processors", "privacyContact", "bookingUrl"] as const;
const required = ["businessName", "legalForm", "street", "postalCode", "city", "country", "email", "hostingProvider", "hostingLocation", "privacyContact"] as const;

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  return Response.json(await getLegalSettings(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Ungültige Anfrage." }, { status: 400 }); }
  const data = {} as Record<(typeof keys)[number], string>;
  for (const key of keys) {
    const value = body[key];
    data[key] = typeof value === "string" ? value.trim().slice(0, key === "processors" ? 2000 : key === "bookingUrl" ? 500 : 254) : "";
  }
  const serverLogDays = Number(body.serverLogDays);
  const inquiryRetentionMonths = Number(body.inquiryRetentionMonths);
  const reviewed = body.reviewed === true;
  if (!Number.isSafeInteger(serverLogDays) || serverLogDays < 1 || serverLogDays > 365 || !Number.isSafeInteger(inquiryRetentionMonths) || inquiryRetentionMonths < 1 || inquiryRetentionMonths > 120) {
    return Response.json({ error: "Speicherfristen müssen positive, plausible Zahlen sein." }, { status: 400 });
  }
  if (data.bookingUrl && !/^https:\/\/[^\s/$.?#].[^\s]*$/i.test(data.bookingUrl)) {
    return Response.json({ error: "Der Buchungs-Link muss eine gültige https-URL sein." }, { status: 400 });
  }
  if (reviewed) {
    const missing = required.filter((key) => !data[key]);
    if (missing.length) return Response.json({ error: `Freigabe nicht möglich. Fehlende Felder: ${missing.join(", ")}` }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.privacyContact)) return Response.json({ error: "Bitte gültige E-Mail-Adressen eintragen." }, { status: 400 });
    if (data.registryNumber && !data.registryCourt) return Response.json({ error: "Zu einer Registernummer gehört ein Registergericht." }, { status: 400 });
  }
  try {
    const existing = await getLegalSettings();
    const value = { ...data, serverLogDays, inquiryRetentionMonths, reviewed, updatedAt: new Date() };
    const [saved] = existing
      ? await db.update(legalSettings).set(value).where(eq(legalSettings.id, 1)).returning()
      : await db.insert(legalSettings).values({ id: 1, ...value }).returning();
    await writeAuditLog({ actor: "Admin", action: reviewed ? "Rechtsangaben freigegeben" : "Rechtsangaben als Entwurf gespeichert", entityType: "legal_settings", entityId: 1 });
    return Response.json({ ...saved, ready: isLegalReady(saved) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Rechtsangaben konnten nicht gespeichert werden." }, { status: 500 });
  }
}
