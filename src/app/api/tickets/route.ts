import { db } from "@/db";
import { tickets } from "@/db/schema";
import { isAdminRequest } from "@/lib/auth";
import { getCustomerRequest } from "@/lib/customer-auth";
import { getLegalSettings, isLegalReady } from "@/lib/legal";
import { writeAuditLog } from "@/lib/audit";
import { forwardCrmEvent, notifyAdmin } from "@/lib/notifications";
import { checkRateLimit, requestIpKey, tooManyRequests } from "@/lib/rate-limit";
import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max) : "";
const statuses = new Set(["Neu", "In Prüfung", "Werkstatt koordiniert", "Gelöst"]);
const priorities = new Set(["Niedrig", "Medium", "Hoch", "Kritisch"]);

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return Response.json({ error: "Nicht angemeldet." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const list = await db.select().from(tickets).orderBy(desc(tickets.createdAt)).limit(200);
    return Response.json(list, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Tickets konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const customer = await getCustomerRequest(request);
  if (!customer) return Response.json({ error: "Bitte zuerst im Kundenportal anmelden." }, { status: 401 });
  if (!isLegalReady(await getLegalSettings())) return Response.json({ error: "Anfragen sind vorübergehend nicht verfügbar. Die Anbieterangaben werden noch vervollständigt." }, { status: 503 });
  const limit = checkRateLimit(`ticket:${requestIpKey(request)}`, 4, 15 * 60 * 1000);
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Ungültige Anfrage." }, { status: 400 }); }
  if (clean(body.website, 200)) return Response.json({ ok: true }, { status: 201 });

  const licensePlate = clean(body.licensePlate, 20).toUpperCase();
  const vehicleModel = clean(body.vehicleModel, 100);
  const issue = typeof body.issue === "string" ? body.issue.trim().slice(0, 3000) : "";
  const priority = clean(body.priority, 20) || "Medium";
  const contactName = clean(body.contactName, 100);
  const contactPhone = clean(body.contactPhone, 50);
  const contactEmail = clean(body.contactEmail, 254).toLowerCase();

  if (!licensePlate || !vehicleModel || issue.length < 5 || !contactName || !contactPhone || !emailPattern.test(contactEmail) || !priorities.has(priority) || body.privacyConsent !== true) {
    return Response.json({ error: "Bitte prüfen Sie die Pflichtfelder, Kontaktdaten und Datenschutzbestätigung." }, { status: 400 });
  }

  try {
    const [created] = await db.insert(tickets).values({
      organizationId: customer.organizationId,
      licensePlate, vehicleModel, issue, priority, status: "Neu", contactName, contactPhone,
      contactEmail, privacyConsent: true,
      adminNotes: "Neue Anfrage eingegangen. Lotys prüft das Anliegen und meldet sich über die angegebenen Kontaktdaten.",
    }).returning({ id: tickets.id, status: tickets.status, createdAt: tickets.createdAt });
    await writeAuditLog({ actor: "Website", action: "Service-Ticket eingegangen", entityType: "ticket", entityId: created.id, details: `${licensePlate} · ${priority}` });
    await notifyAdmin({ type: "Service-Ticket", subject: `Neues Service-Ticket: ${licensePlate}`, text: `Fahrzeug: ${vehicleModel}\nPriorität: ${priority}\nKontakt: ${contactName} · ${contactPhone} · ${contactEmail}\n\n${issue}` });
    await forwardCrmEvent("ticket.created", { id: created.id, licensePlate, vehicleModel, priority, contactName, contactEmail });
    return Response.json({ ok: true, ticket: created }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Service-Anfrage konnte nicht gespeichert werden." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) return Response.json({ error: "Nicht angemeldet." }, { status: 401, headers: { "Cache-Control": "no-store" } });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Ungültige Anfrage." }, { status: 400 }); }
  const id = Number(body.id);
  const status = clean(body.status, 40);
  const adminNotes = typeof body.adminNotes === "string" ? body.adminNotes.trim().slice(0, 8000) : "";
  if (!Number.isSafeInteger(id) || id < 1 || !statuses.has(status)) {
    return Response.json({ error: "Ticket-ID oder Status ist ungültig." }, { status: 400 });
  }

  try {
    const [updated] = await db.update(tickets).set({ status, adminNotes }).where(eq(tickets.id, id)).returning();
    if (!updated) return Response.json({ error: "Ticket nicht gefunden." }, { status: 404 });
    await writeAuditLog({ actor: "Admin", action: "Ticket aktualisiert", entityType: "ticket", entityId: id, details: status });
    return Response.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Ticket konnte nicht aktualisiert werden." }, { status: 500 });
  }
}
