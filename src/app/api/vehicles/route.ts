import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { isAdminRequest } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max) : "";
const allowedStatuses = new Set(["Bereit", "In Werkstatt", "Aktion erforderlich"]);

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return Response.json({ error: "Nicht angemeldet." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const list = await db.select().from(vehicles).orderBy(desc(vehicles.id)).limit(500);
    return Response.json(list, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Fahrzeuge konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Ungültige Anfrage." }, { status: 400 }); }

  const licensePlate = clean(body.licensePlate, 20).toUpperCase();
  const model = clean(body.model, 100);
  const driver = clean(body.driver, 100);
  const nextHu = clean(body.nextHu, 7);
  const mileage = Number(body.mileage ?? 0);
  const status = clean(body.status, 50) || "Bereit";
  const tireStatus = clean(body.tireStatus, 100) || "Nicht erfasst";

  if (!licensePlate || !/^[A-ZÄÖÜ0-9 -]{2,20}$/.test(licensePlate) || !model || !driver || !/^\d{4}-(0[1-9]|1[0-2])$/.test(nextHu)) {
    return Response.json({ error: "Bitte Kennzeichen, Modell, Fahrer und HU-Monat im Format JJJJ-MM prüfen." }, { status: 400 });
  }
  if (!Number.isInteger(mileage) || mileage < 0 || mileage > 2_000_000 || !allowedStatuses.has(status)) {
    return Response.json({ error: "Kilometerstand oder Fahrzeugstatus ist ungültig." }, { status: 400 });
  }

  try {
    const [vehicle] = await db.insert(vehicles).values({ licensePlate, model, driver, nextHu, mileage, status, tireStatus }).returning();
    return Response.json(vehicle, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Fahrzeug konnte nicht gespeichert werden." }, { status: 500 });
  }
}
