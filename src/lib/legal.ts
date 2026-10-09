import { db } from "@/db";
import { legalSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getLegalSettings() {
  try {
    const [settings] = await db.select().from(legalSettings).where(eq(legalSettings.id, 1)).limit(1);
    return settings ?? null;
  } catch (error) {
    // A fresh deployment may be visited before the first schema push.
    // Public pages remain available and simply do not publish legal data.
    console.error("Legal settings unavailable", error);
    return null;
  }
}

export type LegalSettings = NonNullable<Awaited<ReturnType<typeof getLegalSettings>>>;

export function isLegalReady(settings: LegalSettings | null): settings is LegalSettings {
  if (!settings?.reviewed) return false;
  const required = [settings.businessName, settings.legalForm, settings.street, settings.postalCode, settings.city, settings.country, settings.email, settings.hostingProvider, settings.hostingLocation, settings.privacyContact];
  if (!required.every((value) => value.trim().length > 0)) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.privacyContact)) return false;
  if (settings.registryNumber && !settings.registryCourt) return false;
  if (settings.serverLogDays < 1 || settings.inquiryRetentionMonths < 1) return false;
  return true;
}
