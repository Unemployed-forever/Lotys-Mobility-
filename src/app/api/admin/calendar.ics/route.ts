import { db } from "@/db";
import { fleetTasks, vehicles } from "@/db/schema";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toIcsDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.replaceAll("-", "") : null;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const expected = process.env.CALENDAR_FEED_TOKEN;
  if (!expected) return Response.json({ error: "Kalenderfeed ist noch nicht konfiguriert." }, { status: 503 });
  if (!token || token !== expected) return Response.json({ error: "Nicht autorisiert." }, { status: 401 });

  const [tasks, fleet] = await Promise.all([
    db.select().from(fleetTasks),
    db.select().from(vehicles),
  ]);
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const events: string[] = [];
  for (const task of tasks) {
    const date = toIcsDate(task.dueDate);
    if (!date || task.status === "Erledigt") continue;
    events.push(["BEGIN:VEVENT", `UID:lotys-task-${task.id}@lotys-mobility`, `DTSTAMP:${now}`, `DTSTART;VALUE=DATE:${date}`, `SUMMARY:${escapeIcs(`[Lotys] ${task.title}`)}`, `DESCRIPTION:${escapeIcs(`${task.category} · Priorität: ${task.priority} · Zuständig: ${task.assignee}`)}`, "END:VEVENT"].join("\r\n"));
  }
  for (const vehicle of fleet) {
    const due = /^\d{4}-(0[1-9]|1[0-2])$/.test(vehicle.nextHu) ? `${vehicle.nextHu}-01` : "";
    const date = toIcsDate(due);
    if (!date) continue;
    events.push(["BEGIN:VEVENT", `UID:lotys-hu-${vehicle.id}@lotys-mobility`, `DTSTAMP:${now}`, `DTSTART;VALUE=DATE:${date}`, `SUMMARY:${escapeIcs(`[Lotys] HU prüfen: ${vehicle.licensePlate}`)}`, `DESCRIPTION:${escapeIcs(`${vehicle.model} · HU-Monat laut Akte: ${vehicle.nextHu}`)}`, "END:VEVENT"].join("\r\n"));
  }
  const calendar = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Lotys Mobility//Fuhrparkfeed//DE", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n");
  return new Response(calendar, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, max-age=300" } });
}
