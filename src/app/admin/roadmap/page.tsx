import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Seite nicht gefunden", robots: { index: false, follow: false, noarchive: true } };

const phases = [
  { phase: "Phase 1", title: "Angebot & Recht sauber aufsetzen", timeline: "Vor dem öffentlichen Livegang", steps: ["Echte Betreiber-, Hosting- und Datenschutzangaben im privaten Rechtseditor eintragen und fachkundig prüfen.", "Preis und Leistungskatalog mit realen Servicekapazitäten abgleichen.", "Freigabegrenzen und Sonderleistungen vertraglich eindeutig definieren.", "Einzelne Mitarbeiterzugänge, sichere Backups und einen überprüften Löschprozess einplanen."] },
  { phase: "Phase 2", title: "Pilotkunden und tatsächliche Kosten messen", timeline: "Erste 30–90 Tage", steps: ["Gezielte SHK-, Elektro- und technische Servicebetriebe mit 15–40 Fahrzeugen ansprechen.", "Gespräche, Angebote und Follow-ups im Lead-Bereich dokumentieren.", "Pro Fahrzeug Bearbeitungszeit, Werkstattkosten und Ausfalltage als echte Baseline erfassen.", "Pilotangebot schriftlich begrenzen: keine unbezahlten Überführungen oder unbegrenzten Vor-Ort-Einsätze."] },
  { phase: "Phase 3", title: "Operations standardisieren", timeline: "Nach messbaren Pilotdaten", steps: ["Wiederkehrende Ticketkategorien und Standardabläufe vereinheitlichen.", "Werkstattpartner nach Qualität, Durchlaufzeit und Preisen bewerten.", "Aufgaben- und Fristenüberwachung mit verantwortlichen Personen betreiben.", "Deckungsbeitrag je Fahrzeug nach tatsächlicher Personalzeit auswerten."] },
  { phase: "Phase 4", title: "Sichere Skalierung", timeline: "Erst nach wiederholbarer Akquise", steps: ["Mandantentrennung und individuelle Kundenkonten implementieren, bevor echte Kunden das Portal erhalten.", "Benachrichtigungs- und CRM-Integrationen mit Verträgen und Datenschutzprüfung aktivieren.", "Mitarbeitende anhand dokumentierter SOPs einarbeiten.", "Neue Regionen nur erschließen, wenn Qualität und Wirtschaftlichkeit belegbar sind."] },
];

export default async function RoadmapPage() {
  if (!(await isAdminSession())) notFound();
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <Link href="/admin" className="text-sm text-emerald-300">← Zum Control Center</Link>
    <div className="mt-9 rounded-3xl border border-emerald-500/20 bg-slate-950 p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Vertraulich · Teamzugang erforderlich</p><h1 className="mt-3 text-4xl font-extrabold text-white">Lotys Roadmap</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">Interner Arbeitsplan. Keine Kundenkommunikation, keine verbindliche Umsatzprognose und kein öffentliches Leistungsversprechen.</p></div>
    <div className="mt-8 grid gap-5 md:grid-cols-2">{phases.map((item) => <section key={item.phase} className="rounded-2xl border border-slate-800 bg-slate-950 p-6"><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">{item.phase} · {item.timeline}</p><h2 className="mt-3 text-xl font-bold text-white">{item.title}</h2><ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">{item.steps.map((step) => <li key={step} className="flex gap-2"><span className="text-emerald-400">✓</span><span>{step}</span></li>)}</ul></section>)}</div>
    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-6"><h2 className="text-lg font-bold text-white">Entscheidende Kennzahl</h2><p className="mt-2 text-sm leading-7 text-slate-300">Deckungsbeitrag pro betreutem Fahrzeug und Monat <strong>nach</strong> Software, Partnerkosten und real gemessener Operations-Zeit. Alle Modellannahmen müssen gegen echte Pilotdaten geprüft werden.</p></div>
  </main>;
}
