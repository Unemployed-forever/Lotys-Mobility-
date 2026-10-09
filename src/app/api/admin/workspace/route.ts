import { db } from "@/db";
import {
  auditLogs,
  drivers,
  fleetChecks,
  fleetCosts,
  fleetTasks,
  integrationConfigs,
  notificationOutbox,
  organizations,
  vehicleDocuments,
  vehicles,
  workshopPartners,
} from "@/db/schema";
import { isAdminRequest } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").slice(0, max) : "";
const numericId = (value: unknown) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
const safeDate = (value: unknown) => {
  const date = clean(value, 10);
  return !date || /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
};

function unauthorized() {
  return Response.json({ error: "Nicht angemeldet." }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const [companyRows, vehicleRows, driverRows, documentRows, taskRows, costRows, partnerRows, leadRows, outboxRows, integrationRows, auditRows] = await Promise.all([
      db.select().from(organizations).orderBy(desc(organizations.createdAt)).limit(200),
      db.select().from(vehicles).orderBy(desc(vehicles.createdAt)).limit(500),
      db.select().from(drivers).orderBy(desc(drivers.createdAt)).limit(500),
      db.select().from(vehicleDocuments).orderBy(desc(vehicleDocuments.createdAt)).limit(500),
      db.select().from(fleetTasks).orderBy(desc(fleetTasks.createdAt)).limit(500),
      db.select().from(fleetCosts).orderBy(desc(fleetCosts.createdAt)).limit(1000),
      db.select().from(workshopPartners).orderBy(desc(workshopPartners.createdAt)).limit(300),
      db.select().from(fleetChecks).orderBy(desc(fleetChecks.createdAt)).limit(500),
      db.select().from(notificationOutbox).orderBy(desc(notificationOutbox.createdAt)).limit(300),
      db.select().from(integrationConfigs).orderBy(desc(integrationConfigs.createdAt)).limit(100),
      db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(300),
    ]);
    return Response.json({ organizations: companyRows, vehicles: vehicleRows, drivers: driverRows, documents: documentRows, tasks: taskRows, costs: costRows, workshops: partnerRows, leads: leadRows, outbox: outboxRows, integrations: integrationRows, audit: auditRows, capabilities: { emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM && process.env.NOTIFICATION_EMAIL), crmConfigured: Boolean(process.env.CRM_WEBHOOK_URL), calendarConfigured: Boolean(process.env.CALENDAR_FEED_TOKEN), totpConfigured: Boolean(process.env.ADMIN_TOTP_SECRET) } }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Workspace-Daten konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Ungültige Anfrage." }, { status: 400 }); }
  const action = clean(body.action, 60);

  try {
    if (action === "create-organization") {
      const name = clean(body.name, 150);
      if (!name) return Response.json({ error: "Betriebsname ist erforderlich." }, { status: 400 });
      const [row] = await db.insert(organizations).values({ name, industry: clean(body.industry, 100), city: clean(body.city, 100), contactName: clean(body.contactName, 100), contactEmail: clean(body.contactEmail, 254), contactPhone: clean(body.contactPhone, 50), status: clean(body.status, 30) || "Interessent", notes: clean(body.notes, 4000) }).returning();
      await writeAuditLog({ actor: "Admin", action: "Betrieb angelegt", entityType: "organization", entityId: row.id, details: row.name });
      return Response.json(row, { status: 201 });
    }

    if (action === "create-vehicle") {
      const licensePlate = clean(body.licensePlate, 20).toUpperCase();
      const model = clean(body.model, 100);
      const driver = clean(body.driver, 100) || "Nicht zugewiesen";
      const nextHu = clean(body.nextHu, 7);
      const mileage = Number(body.mileage || 0);
      const organizationId = body.organizationId ? numericId(body.organizationId) : null;
      if (!licensePlate || !/^[A-ZÄÖÜ0-9 -]{2,20}$/.test(licensePlate) || !model || !/^\d{4}-(0[1-9]|1[0-2])$/.test(nextHu) || !Number.isInteger(mileage) || mileage < 0) return Response.json({ error: "Kennzeichen, Modell, HU-Monat oder Kilometerstand prüfen." }, { status: 400 });
      const [row] = await db.insert(vehicles).values({ organizationId, licensePlate, model, driver, nextHu, mileage, status: clean(body.status, 50) || "Bereit", tireStatus: clean(body.tireStatus, 100) || "Nicht erfasst" }).returning();
      await writeAuditLog({ actor: "Admin", action: "Fahrzeug angelegt", entityType: "vehicle", entityId: row.id, details: `${row.licensePlate} · ${row.model}` });
      return Response.json(row, { status: 201 });
    }

    if (action === "create-driver") {
      const fullName = clean(body.fullName, 120);
      const organizationId = body.organizationId ? numericId(body.organizationId) : null;
      const licenseCheckDue = safeDate(body.licenseCheckDue);
      if (!fullName || licenseCheckDue === null) return Response.json({ error: "Name und gültiges Kontrolldatum prüfen." }, { status: 400 });
      const [row] = await db.insert(drivers).values({ organizationId, fullName, email: clean(body.email, 254), phone: clean(body.phone, 50), licenseCheckDue, status: clean(body.status, 30) || "Aktiv", notes: clean(body.notes, 4000) }).returning();
      await writeAuditLog({ actor: "Admin", action: "Fahrer angelegt", entityType: "driver", entityId: row.id, details: row.fullName });
      return Response.json(row, { status: 201 });
    }

    if (action === "create-document") {
      const vehicleId = numericId(body.vehicleId);
      const documentType = clean(body.documentType, 80);
      const fileName = clean(body.fileName, 255);
      const expiresOn = safeDate(body.expiresOn);
      if (!vehicleId || !documentType || !fileName || expiresOn === null) return Response.json({ error: "Fahrzeug, Dokumenttyp, Dateiname und Ablaufdatum prüfen." }, { status: 400 });
      const [row] = await db.insert(vehicleDocuments).values({ vehicleId, documentType, fileName, storageReference: clean(body.storageReference, 2000), expiresOn, notes: clean(body.notes, 4000) }).returning();
      await writeAuditLog({ actor: "Admin", action: "Dokumentverweis angelegt", entityType: "vehicle_document", entityId: row.id, details: `${documentType}: ${fileName}` });
      return Response.json(row, { status: 201 });
    }

    if (action === "create-task") {
      const title = clean(body.title, 200);
      const dueDate = safeDate(body.dueDate);
      const organizationId = body.organizationId ? numericId(body.organizationId) : null;
      const vehicleId = body.vehicleId ? numericId(body.vehicleId) : null;
      if (!title || dueDate === null) return Response.json({ error: "Titel und Fälligkeitsdatum prüfen." }, { status: 400 });
      const [row] = await db.insert(fleetTasks).values({ organizationId, vehicleId, title, category: clean(body.category, 60) || "Allgemein", dueDate, priority: clean(body.priority, 20) || "Normal", status: "Offen", assignee: clean(body.assignee, 100) || "Arthur", notes: clean(body.notes, 4000) }).returning();
      await writeAuditLog({ actor: "Admin", action: "Aufgabe angelegt", entityType: "fleet_task", entityId: row.id, details: row.title });
      return Response.json(row, { status: 201 });
    }

    if (action === "update-task") {
      const id = numericId(body.id);
      const status = clean(body.status, 30);
      if (!id || !["Offen", "In Arbeit", "Erledigt"].includes(status)) return Response.json({ error: "Aufgabe oder Status ist ungültig." }, { status: 400 });
      const [row] = await db.update(fleetTasks).set({ status, completedAt: status === "Erledigt" ? new Date() : null }).where(eq(fleetTasks.id, id)).returning();
      if (!row) return Response.json({ error: "Aufgabe nicht gefunden." }, { status: 404 });
      await writeAuditLog({ actor: "Admin", action: "Aufgabenstatus geändert", entityType: "fleet_task", entityId: id, details: status });
      return Response.json(row);
    }

    if (action === "create-cost") {
      const amountCents = Number(body.amountCents);
      const occurredOn = safeDate(body.occurredOn);
      const category = clean(body.category, 60);
      const organizationId = body.organizationId ? numericId(body.organizationId) : null;
      const vehicleId = body.vehicleId ? numericId(body.vehicleId) : null;
      if (!category || !Number.isInteger(amountCents) || amountCents < 0 || amountCents > 10_000_000 || !occurredOn) return Response.json({ error: "Kategorie, Betrag und Datum prüfen." }, { status: 400 });
      const [row] = await db.insert(fleetCosts).values({ organizationId, vehicleId, category, amountCents, occurredOn, vendor: clean(body.vendor, 150), notes: clean(body.notes, 4000) }).returning();
      await writeAuditLog({ actor: "Admin", action: "Kosten erfasst", entityType: "fleet_cost", entityId: row.id, details: `${row.category}: ${row.amountCents} Cent` });
      return Response.json(row, { status: 201 });
    }

    if (action === "create-workshop") {
      const name = clean(body.name, 150);
      const rating = Number(body.rating || 0);
      if (!name || !Number.isInteger(rating) || rating < 0 || rating > 5) return Response.json({ error: "Werkstattname oder Bewertung prüfen." }, { status: 400 });
      const [row] = await db.insert(workshopPartners).values({ name, city: clean(body.city, 100), email: clean(body.email, 254), phone: clean(body.phone, 50), services: clean(body.services, 1500), rating, active: body.active !== false, notes: clean(body.notes, 4000) }).returning();
      await writeAuditLog({ actor: "Admin", action: "Werkstattpartner angelegt", entityType: "workshop_partner", entityId: row.id, details: row.name });
      return Response.json(row, { status: 201 });
    }

    if (action === "update-lead") {
      const id = numericId(body.id);
      const salesStatus = clean(body.salesStatus, 40);
      const nextFollowUp = safeDate(body.nextFollowUp);
      if (!id || !["Neu", "Kontaktiert", "Termin", "Angebot", "Gewonnen", "Verloren"].includes(salesStatus) || nextFollowUp === null) return Response.json({ error: "Lead-Status oder Follow-up-Datum prüfen." }, { status: 400 });
      const [row] = await db.update(fleetChecks).set({ salesStatus, nextFollowUp, salesNotes: clean(body.salesNotes, 4000) }).where(eq(fleetChecks.id, id)).returning();
      if (!row) return Response.json({ error: "Lead nicht gefunden." }, { status: 404 });
      await writeAuditLog({ actor: "Admin", action: "Lead aktualisiert", entityType: "fleet_check", entityId: id, details: salesStatus });
      return Response.json(row);
    }

    if (action === "create-integration") {
      const provider = clean(body.provider, 80);
      const purpose = clean(body.purpose, 120);
      if (!provider || !purpose) return Response.json({ error: "Anbieter und Zweck sind erforderlich." }, { status: 400 });
      const [row] = await db.insert(integrationConfigs).values({ provider, purpose, status: clean(body.status, 30) || "Nicht konfiguriert", notes: clean(body.notes, 4000) }).returning();
      await writeAuditLog({ actor: "Admin", action: "Integration dokumentiert", entityType: "integration", entityId: row.id, details: `${provider}: ${purpose}` });
      return Response.json(row, { status: 201 });
    }

    return Response.json({ error: "Unbekannte Admin-Aktion." }, { status: 400 });
  } catch {
    return Response.json({ error: "Änderung konnte nicht gespeichert werden." }, { status: 500 });
  }
}
