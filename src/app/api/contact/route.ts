import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { isAdminRequest } from "@/lib/auth";
import { getLegalSettings, isLegalReady } from "@/lib/legal";
import { writeAuditLog } from "@/lib/audit";
import { forwardCrmEvent, notifyAdmin } from "@/lib/notifications";
import { checkRateLimit, requestIpKey, tooManyRequests } from "@/lib/rate-limit";
import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").slice(0, max) : "";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const messages = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
    return Response.json(messages, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Nachrichten konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isLegalReady(await getLegalSettings())) return Response.json({ error: "Anfragen sind vorübergehend nicht verfügbar. Die Anbieterangaben werden noch vervollständigt." }, { status: 503 });
  const limit = checkRateLimit(`contact:${requestIpKey(request)}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Bitte senden Sie das Formular erneut." }, { status: 400 }); }
  if (clean(body.website, 200)) return Response.json({ ok: true }, { status: 201 });

  const companyName = clean(body.companyName, 150);
  const contactName = clean(body.contactName, 100);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 50);
  const subject = clean(body.subject, 160);
  const message = typeof body.message === "string" ? body.message.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, 5000) : "";

  if (!contactName || !email || !subject || message.length < 10 || !emailPattern.test(email) || body.privacyConsent !== true) {
    return Response.json({ error: "Bitte prüfen Sie Name, gültige E-Mail, Betreff, Nachricht (mindestens 10 Zeichen) und Datenschutzhinweis." }, { status: 400 });
  }

  try {
    const [created] = await db.insert(contactMessages).values({ companyName, contactName, email, phone, subject, message, privacyConsent: true }).returning({ id: contactMessages.id });
    await writeAuditLog({ actor: "Website", action: "Kontaktanfrage eingegangen", entityType: "contact_message", entityId: created.id, details: subject });
    await notifyAdmin({ type: "Kontaktanfrage", subject: `Neue Kontaktanfrage: ${subject}`, text: `Kontakt: ${contactName}\nFirma: ${companyName || "–"}\nE-Mail: ${email}\nTelefon: ${phone || "–"}\n\n${message}` });
    await forwardCrmEvent("contact.created", { id: created.id, companyName, contactName, email, phone, subject });
    return Response.json({ ok: true, message: "Danke — Ihre Nachricht wurde übermittelt. Wir melden uns bei Ihnen." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Ihre Nachricht konnte gerade nicht gespeichert werden. Bitte versuchen Sie es später erneut." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return Response.json({ error: "Nicht angemeldet." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Ungültige Anfrage." }, { status: 400 }); }
  const id = Number(body.id);
  const status = clean(body.status, 30);
  if (!Number.isSafeInteger(id) || id < 1 || !["Neu", "Gesehen", "Erledigt"].includes(status)) {
    return Response.json({ error: "Nachrichten-ID oder Status ist ungültig." }, { status: 400 });
  }
  try {
    const [updated] = await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id)).returning({ id: contactMessages.id, status: contactMessages.status });
    if (!updated) return Response.json({ error: "Nachricht nicht gefunden." }, { status: 404 });
    await writeAuditLog({ actor: "Admin", action: "Kontaktstatus aktualisiert", entityType: "contact_message", entityId: id, details: status });
    return Response.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Nachricht konnte nicht aktualisiert werden." }, { status: 500 });
  }
}
