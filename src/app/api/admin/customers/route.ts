import { NextRequest } from "next/server";
import { db } from "@/db";
import { customerAccounts, organizations } from "@/db/schema";
import { isAdminRequest } from "@/lib/auth";
import { hashCustomerPassword } from "@/lib/customer-auth";
import { writeAuditLog } from "@/lib/audit";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
const denied = () => Response.json({ error: "Nicht angemeldet." }, { status: 401, headers: { "Cache-Control": "no-store" } });
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return denied();
  const accounts = await db.select({ id: customerAccounts.id, organizationId: customerAccounts.organizationId, name: customerAccounts.name, email: customerAccounts.email, approved: customerAccounts.approved, createdAt: customerAccounts.createdAt }).from(customerAccounts);
  return Response.json(accounts, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return denied();
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Ungültige Anfrage." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const password = typeof body.password === "string" ? body.password : "";
  const organizationId = Number(body.organizationId);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || password.length < 12 || password.length > 200 || !Number.isSafeInteger(organizationId) || organizationId < 1) return Response.json({ error: "Betrieb, Name, gültige E-Mail und Passwort mit mindestens 12 Zeichen erforderlich." }, { status: 400 });
  const [organization] = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.id, organizationId)).limit(1);
  if (!organization) return Response.json({ error: "Betrieb nicht gefunden. Bitte zuerst im Control Center anlegen." }, { status: 400 });
  try {
    const [created] = await db.insert(customerAccounts).values({ email, name, organizationId, passwordHash: hashCustomerPassword(password), approved: true }).returning({ id: customerAccounts.id, email: customerAccounts.email });
    await writeAuditLog({ actor: "Admin", action: "Kundenzugang freigegeben", entityType: "customer_account", entityId: created.id });
    return Response.json({ ok: true, id: created.id, email: created.email }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Konto konnte nicht erstellt werden. E-Mail möglicherweise bereits vergeben." }, { status: 409 }); }
}
export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return denied();
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Ungültige Anfrage." }, { status: 400 }); }
  const id = Number(body.id);
  if (!Number.isSafeInteger(id) || id < 1 || typeof body.approved !== "boolean") return Response.json({ error: "Ungültige Angaben." }, { status: 400 });
  const [updated] = await db.update(customerAccounts).set({ approved: body.approved }).where(eq(customerAccounts.id, id)).returning({ id: customerAccounts.id, approved: customerAccounts.approved });
  if (!updated) return Response.json({ error: "Konto nicht gefunden." }, { status: 404 });
  await writeAuditLog({ actor: "Admin", action: updated.approved ? "Kundenzugang aktiviert" : "Kundenzugang gesperrt", entityType: "customer_account", entityId: id });
  return Response.json(updated, { headers: { "Cache-Control": "no-store" } });
}
