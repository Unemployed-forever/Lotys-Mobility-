import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export async function writeAuditLog(input: {
  actor?: string;
  action: string;
  entityType: string;
  entityId?: number | null;
  details?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      actor: input.actor || "System",
      action: input.action.slice(0, 120),
      entityType: input.entityType.slice(0, 80),
      entityId: input.entityId ?? null,
      details: (input.details || "").slice(0, 4000),
    });
  } catch (error) {
    console.error("Could not write audit log", error);
  }
}
