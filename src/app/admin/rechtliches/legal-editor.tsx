"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Save, ShieldCheck, AlertTriangle } from "lucide-react";

type FieldName = "businessName" | "legalForm" | "street" | "postalCode" | "city" | "country" | "email" | "phone" | "representative" | "registryCourt" | "registryNumber" | "vatId" | "editorialResponsible" | "hostingProvider" | "hostingLocation" | "processors" | "privacyContact" | "bookingUrl";
type LegalForm = Record<FieldName, string> & { serverLogDays: number; inquiryRetentionMonths: number; reviewed: boolean };
const defaults: LegalForm = { businessName: "Lotys Mobility", legalForm: "", street: "", postalCode: "", city: "", country: "Deutschland", email: "info@lotys-mobility.de", phone: "+49 155 10663095", representative: "", registryCourt: "", registryNumber: "", vatId: "", editorialResponsible: "", hostingProvider: "", hostingLocation: "", processors: "", privacyContact: "info@lotys-mobility.de", bookingUrl: "", serverLogDays: 14, inquiryRetentionMonths: 12, reviewed: false };
const fields: { key: FieldName; label: string; hint?: string; required?: boolean }[] = [
  { key: "businessName", label: "Vollständiger Name / Firma", required: true, hint: "Exakte Bezeichnung laut Geschäftsanmeldung/Handelsregister. Keine Rechtsform erfinden." },
  { key: "legalForm", label: "Rechtsform", required: true, hint: "Zum Beispiel Einzelunternehmen oder GmbH – nur wenn tatsächlich zutreffend." },
  { key: "street", label: "Straße und Hausnummer", required: true },
  { key: "postalCode", label: "Postleitzahl", required: true },
  { key: "city", label: "Ort", required: true },
  { key: "country", label: "Land", required: true },
  { key: "email", label: "Öffentliche geschäftliche E-Mail", required: true },
  { key: "phone", label: "Geschäftliche Telefonnummer (falls vorhanden)" },
  { key: "representative", label: "Vertretungsberechtigte Person (falls juristische Person)" },
  { key: "registryCourt", label: "Registergericht (falls eingetragen)" },
  { key: "registryNumber", label: "Registernummer (falls eingetragen)" },
  { key: "vatId", label: "Umsatzsteuer-ID (falls vorhanden)" },
  { key: "editorialResponsible", label: "Redaktionell Verantwortlicher (falls erforderlich)" },
  { key: "hostingProvider", label: "Tatsächlicher Hosting-/Datenbankanbieter", required: true },
  { key: "hostingLocation", label: "Tatsächlicher Hosting-Standort", required: true },
  { key: "processors", label: "Weitere Auftragsverarbeiter (nur tatsächlich eingesetzte)", hint: "z. B. E-Mail-Versand, CRM; leer lassen, wenn nicht aktiv." },
  { key: "privacyContact", label: "E-Mail für Datenschutzanfragen", required: true },
  { key: "bookingUrl", label: "Link zur Terminbuchung (optional)", hint: "https-Link zu Ihrem Kalender-Tool (z. B. Calendly). Erscheint auf der Dankeseite und der Kontaktseite." },
];
export default function LegalEditor() {
  const [form, setForm] = useState<LegalForm>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/admin/legal", { cache: "no-store" }).then(async (response) => {
    if (!response.ok) throw new Error("Daten konnten nicht geladen werden.");
    const data = await response.json();
    if (data) setForm({ ...defaults, ...data });
  }).catch((cause) => setError(cause instanceof Error ? cause.message : "Ladefehler")).finally(() => setLoading(false)); }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/legal", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Speichern fehlgeschlagen.");
      setForm({ ...defaults, ...data });
      setMessage(data.ready ? "Rechtsangaben gespeichert und für die öffentlichen Rechteseiten freigegeben." : "Entwurf gespeichert. Öffentlich wird noch kein fertiges Impressum behauptet.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Speichern fehlgeschlagen."); }
    finally { setSaving(false); }
  }
  const maxLen = (key: FieldName) => (key === "processors" ? 2000 : key === "bookingUrl" ? 500 : 254);
  return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
    <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-emerald-300"><ArrowLeft className="h-4 w-4" /> Control Center</Link>
    <div className="mt-7"><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Nur für Lotys-Team</p><h1 className="mt-2 text-3xl font-extrabold text-white">Impressum & Datenschutz konfigurieren</h1><p className="mt-3 text-sm leading-6 text-slate-400\">Nur deine tatsächlichen Unternehmensdaten eintragen. Die Freigabe ersetzt keine rechtliche Prüfung; Inhalte vor dem Livegang von einer fachkundigen Person gegenprüfen lassen.</p></div>
    <div className="my-7 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-100"><AlertTriangle className="h-5 w-5 shrink-0" /><span>Solange die echten Pflichtangaben fehlen, sind die öffentlichen Rechteseiten nicht als vollständige Anbieterkennzeichnung nutzbar. Keine fiktive Adresse oder GmbH eintragen.</span></div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-950/40 p-4 text-red-200">{error}</p>}{message && <p role="status" className="mb-4 rounded-xl bg-emerald-950/40 p-4 text-emerald-200">{message}</p>}
    {loading ? <p className="text-sm text-slate-400">Angaben werden geladen …</p> : <form onSubmit={save} className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">{fields.map(({ key, label, hint, required }) => <label key={key} className={`text-sm font-semibold text-slate-200 ${key === "processors" ? "sm:col-span-2" : ""}`}>{label}{required ? " *" : ""}<input type={key === "email" || key === "privacyContact" ? "email" : key === "bookingUrl" ? "url" : "text"} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value, reviewed: false })} required={required} maxLength={maxLen(key)} placeholder={key === "bookingUrl" ? "https://…" : undefined} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-emerald-400" />{hint && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}</label>)}</div>
      <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-200">Protokoll-Aufbewahrung in Tagen<input type="number" min={1} max={365} value={form.serverLogDays} onChange={(event) => setForm({ ...form, serverLogDays: Number(event.target.value), reviewed: false })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white" /></label><label className="text-sm font-semibold text-slate-200">Anfragen-Aufbewahrung in Monaten<input type="number" min={1} max={120} value={form.inquiryRetentionMonths} onChange={(event) => setForm({ ...form, inquiryRetentionMonths: Number(event.target.value), reviewed: false })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white" /></label></div>
      <p className="text-xs leading-5 text-slate-400">Aufbewahrungswerte beschreiben erst die geplante Frist; technische Löschung und tatsächliche Server-Logfristen müssen beim Hosting verifiziert werden.</p>
      <label className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-sm text-slate-200"><input type="checkbox" checked={form.reviewed} onChange={(event) => setForm({ ...form, reviewed: event.target.checked })} className="mt-1 h-4 w-4 accent-emerald-400" /><span>Ich bestätige als Verantwortlicher, dass diese Angaben wahr, vollständig und vor öffentlicher Nutzung geprüft wurden. Erst dann freigeben.</span></label>
      <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Speichert …" : form.reviewed ? "Prüfen und freigeben" : "Entwurf speichern"}</button>
      <p className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4" /> Diese Eingabemaske ist nur nach Team-Anmeldung erreichbar.</p>
    </form>}
  </main>;
}
