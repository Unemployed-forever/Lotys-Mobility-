import { db } from "@/db";
import { fleetChecks } from "@/db/schema";
import { isAdminRequest } from "@/lib/auth";
import { getLegalSettings, isLegalReady } from "@/lib/legal";
import { writeAuditLog } from "@/lib/audit";
import { forwardCrmEvent, notifyAdmin } from "@/lib/notifications";
import { checkRateLimit, requestIpKey, tooManyRequests } from "@/lib/rate-limit";
import { desc } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max) : "";
const processes = new Set(["Ich selbst als GF", "Eine Bürokraft nebenbei", "Unsere Fahrer selbst", "Niemand wirklich"]);
const pains = new Set([
  "Werkstattrechnungen zu hoch/ungeprüft",
  "Termine (HU/Service) vergessen",
  "Fahrzeug-Ausfallzeiten kosten Geld",
  "Schadenabwicklung chaotisch",
  "Kein Kostenüberblick",
]);

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return Response.json({ error: "Nicht angemeldet." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const list = await db.select().from(fleetChecks).orderBy(desc(fleetChecks.createdAt)).limit(200);
    return Response.json(list, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Checks konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isLegalReady(await getLegalSettings())) return Response.json({ error: "Anfragen sind vorübergehend nicht verfügbar. Die Anbieterangaben werden noch vervollständigt." }, { status: 503 });
  const limit = checkRateLimit(`fleet-check:${requestIpKey(request)}`, 3, 15 * 60 * 1000);
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Ungültige Anfrage." }, { status: 400 }); }
  if (clean(body.website, 200)) return Response.json({ ok: true }, { status: 201 });

  const companyName = clean(body.companyName, 150);
  const contactName = clean(body.contactName, 100);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 50);
  const vehicleCount = Number(body.vehicleCount);
  const currentProcess = clean(body.currentProcess, 100);
  const mainPain = clean(body.mainPain, 100);

  if (!companyName || !contactName || !emailPattern.test(email) || !phone || !Number.isInteger(vehicleCount) || vehicleCount < 1 || vehicleCount > 5000 || !processes.has(currentProcess) || !pains.has(mainPain) || body.privacyConsent !== true) {
    return Response.json({ error: "Bitte prüfen Sie Ihre Angaben und bestätigen Sie den Datenschutzhinweis." }, { status: 400 });
  }

  // Orientierungswert für ein Erstgespräch, keine Rechts-, Technik- oder Fuhrparkprüfung.
  let score = 90;
  if (vehicleCount >= 5 && vehicleCount <= 9) score -= 15;
  else if (vehicleCount >= 10 && vehicleCount <= 30) score -= 35;
  else if (vehicleCount >= 31 && vehicleCount <= 60) score -= 45;
  else if (vehicleCount > 60) score -= 40;
  if (currentProcess === "Ich selbst als GF") score -= 15;
  else if (currentProcess === "Eine Bürokraft nebenbei") score -= 10;
  else if (currentProcess === "Unsere Fahrer selbst" || currentProcess === "Niemand wirklich") score -= 20;
  score = Math.max(15, Math.min(95, score));

  const recommendationMap: Record<string, string[]> = {
    "Werkstattrechnungen zu hoch/ungeprüft": [
      "Stichproben und klare Prüfkriterien für Werkstattrechnungen einführen; Einsparungen erst anhand realer Belege messen.",
      "Freigabegrenzen und einen nachvollziehbaren Angebotsprozess festlegen.",
      "Stundensätze, Teile und Leistungsumfang mehrerer regionaler Werkstätten vergleichen.",
    ],
    "Termine (HU/Service) vergessen": [
      "HU-, Service- und weitere relevante Termine zentral mit Vorlauf und einer verantwortlichen Person dokumentieren.",
      "Erinnerungen und Eskalationen mit Verantwortlichen und Vertretung verbindlich definieren.",
      "Anforderungen für Fahrerlaubnis- und Arbeitsschutzkontrollen fachkundig prüfen und passende Fachverfahren einsetzen.",
    ],
    "Fahrzeug-Ausfallzeiten kosten Geld": [
      "Ausfallzeiten und deren Ursachen je Fahrzeug erfassen, bevor Ziele oder Einsparungen versprochen werden.",
      "Werkstattabläufe und Ersatzmobilität für kritische Einsatzfahrzeuge vorab abstimmen.",
      "Wiederkehrende Mängel früh melden und Reparaturangebote mit definierten Freigabegrenzen prüfen.",
    ],
    "Schadenabwicklung chaotisch": [
      "Einheitliche Schadenaufnahme mit Fotos, Datum, Fahrer und nächstem Schritt einführen.",
      "Zuständigkeiten, Fristen und Informationswege je Schadenfall festlegen.",
      "Schadenfälle regelmäßig auswerten und bei Versicherungsfragen nur qualifizierte Partner einbinden.",
    ],
    "Kein Kostenüberblick": [
      "Kosten je Fahrzeug nach Reparatur, Reifen, Energie, Leasing und Ausfall getrennt sammeln.",
      "Kilometerstände regelmäßig erfassen und Kosten pro Kilometer vergleichbar machen.",
      "Ein monatliches Kurzreporting mit Ausreißern, Verantwortlichen und nächsten Maßnahmen starten.",
    ],
  };
  const recommendations = recommendationMap[mainPain];

  try {
    const [created] = await db.insert(fleetChecks).values({
      companyName, contactName, email, phone, vehicleCount, currentProcess, mainPain,
      privacyConsent: true, calculatedScore: score, recommendations: recommendations.join("|"),
    }).returning({ id: fleetChecks.id, companyName: fleetChecks.companyName, vehicleCount: fleetChecks.vehicleCount, calculatedScore: fleetChecks.calculatedScore, recommendations: fleetChecks.recommendations, createdAt: fleetChecks.createdAt });
    await writeAuditLog({ actor: "Website", action: "Fuhrpark-Check eingegangen", entityType: "fleet_check", entityId: created.id, details: `${companyName} · ${vehicleCount} Fahrzeuge` });
    await notifyAdmin({ type: "Fuhrpark-Check", subject: `Neuer Fuhrpark-Check: ${companyName}`, text: `Kontakt: ${contactName}\nE-Mail: ${email}\nTelefon: ${phone}\nFahrzeuge: ${vehicleCount}\nOrganisation: ${currentProcess}\nHauptthema: ${mainPain}\nOrientierung: ${score}/100` });
    await forwardCrmEvent("fleet_check.created", { id: created.id, companyName, contactName, email, phone, vehicleCount, mainPain, score });
    return Response.json(created, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Der Fuhrpark-Check konnte nicht gespeichert werden." }, { status: 500 });
  }
}
