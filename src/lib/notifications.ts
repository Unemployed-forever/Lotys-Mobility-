import { db } from "@/db";
import { notificationOutbox } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Sends through Resend only when RESEND_API_KEY, RESEND_FROM and NOTIFICATION_EMAIL exist. */
export async function forwardCrmEvent(event: string, payload: Record<string, unknown>) {
  const endpoint = process.env.CRM_WEBHOOK_URL;
  if (!endpoint) return false;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload, sentAt: new Date().toISOString() }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function notifyAdmin(input: { type: string; subject: string; text: string }) {
  const recipient = process.env.NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM;
  const apiKey = process.env.RESEND_API_KEY;
  const [row] = await db.insert(notificationOutbox).values({
    type: input.type.slice(0, 50),
    recipient: recipient || "Nicht konfiguriert",
    subject: input.subject.slice(0, 200),
    payload: input.text.slice(0, 5000),
    status: recipient && from && apiKey ? "Ausstehend" : "Nicht konfiguriert",
  }).returning();

  if (!recipient || !from || !apiKey) return row;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [recipient], subject: input.subject, text: input.text }),
    });
    const payload = await response.json().catch(() => ({})) as { id?: string; message?: string };
    if (!response.ok) throw new Error(payload.message || `HTTP ${response.status}`);
    await db.update(notificationOutbox).set({ status: "Gesendet", providerMessageId: payload.id || "", sentAt: new Date() }).where(eq(notificationOutbox.id, row.id));
  } catch (error) {
    await db.update(notificationOutbox).set({ status: "Fehlgeschlagen", errorMessage: error instanceof Error ? error.message.slice(0, 4000) : "Unbekannter Fehler" }).where(eq(notificationOutbox.id, row.id));
  }
  return row;
}
