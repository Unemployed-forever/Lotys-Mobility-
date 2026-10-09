"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

interface CheckResult {
  id: number;
  companyName: string;
  vehicleCount: number;
  calculatedScore: number;
  recommendations: string;
  createdAt: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pains = [
  { value: "Werkstattrechnungen zu hoch/ungeprüft", label: "Rechnungen ungeprüft", hint: "Werkstattrechnungen werden ohne Prüfung bezahlt." },
  { value: "Termine (HU/Service) vergessen", label: "Fristen & Termine", hint: "HU, Service oder Kontrollen werden verpasst." },
  { value: "Fahrzeug-Ausfallzeiten kosten Geld", label: "Stillstandzeiten", hint: "Ausgefallene Fahrzeuge blockieren den Betrieb." },
  { value: "Schadenabwicklung chaotisch", label: "Chaos bei Schäden", hint: "Schäden werden ad-hoc und ungeordnet abgewickelt." },
];

export default function FleetCheckStandaloneForm() {
  const [form, setForm] = useState({ companyName: "", contactName: "", email: "", phone: "", vehicleCount: "20", currentProcess: "Ich selbst als GF", mainPain: pains[0].value, privacyConsent: false, website: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [tried, setTried] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const invalid = {
    companyName: tried && !form.companyName.trim(),
    contactName: tried && !form.contactName.trim(),
    email: tried && !emailPattern.test(form.email.trim()),
    phone: tried && !form.phone.trim(),
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTried(true);
    setError("");
    if (!form.companyName.trim() || !form.contactName.trim() || !emailPattern.test(form.email.trim()) || !form.phone.trim()) {
      setError("Bitte prüfen Sie die markierten Felder: Alle Kontaktdaten sind erforderlich, die E-Mail-Adresse muss gültig sein.");
      document.getElementById("fc-company")?.focus();
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/fleet-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, vehicleCount: parseInt(form.vehicleCount) || 15 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Es gab ein Problem. Bitte prüfen Sie Ihre Angaben.");
        return;
      }
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(typeof navigator !== "undefined" && !navigator.onLine ? "Sie scheinen offline zu sein. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut." : "Netzwerkfehler bei der Übermittlung. Bitte versuchen Sie es erneut.");
    } finally {
      setPending(false);
    }
  }

  const input = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400";
  const label = "block text-sm font-semibold text-slate-200";
  const errorRing = "border-red-500";

  if (result) {
    const recs = result.recommendations ? result.recommendations.split("|") : [];
    return (
      <div role="status" aria-live="polite" className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Auswertung für {result.companyName}</h2>
            <p className="mt-1 text-xs text-slate-400">Erstellt am {new Date(result.createdAt).toLocaleDateString("de-DE")} · Vorgang #{result.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-slate-400">Orientierungswert</span>
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-950/40 text-xl font-black text-emerald-400">{result.calculatedScore}</span>
          </div>
        </div>
        <p className="text-sm leading-7 text-slate-300">
          Unverbindliche Ersteinschätzung auf Basis Ihrer Angaben zu {result.vehicleCount} Fahrzeugen.
          Sie ersetzt keine Prüfung mit echten Fahrzeug-, Kosten- und Prozessdaten.
        </p>
        <ol className="space-y-3">
          {recs.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm leading-6 text-slate-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-950 font-bold text-emerald-400">{i + 1}</span>
              {rec}
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-5">
          <Link href="/kontakt" className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950">Gespräch vereinbaren</Link>
          <Link href="/" className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-bold text-white">Zur Startseite</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate={false} className="space-y-8">
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-white">1 · Ihre Kontaktdaten</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={label} htmlFor="fc-company">Firma / Betrieb *<input id="fc-company" className={`${input} ${invalid.companyName ? errorRing : ""}`} aria-invalid={invalid.companyName} autoComplete="organization" maxLength={150} required value={form.companyName} onChange={(e) => set({ companyName: e.target.value })} placeholder="Name des Betriebs" /></label>
          <label className={label} htmlFor="fc-name">Ansprechpartner(in) *<input id="fc-name" className={`${input} ${invalid.contactName ? errorRing : ""}`} aria-invalid={invalid.contactName} autoComplete="name" maxLength={100} required value={form.contactName} onChange={(e) => set({ contactName: e.target.value })} placeholder="Ihr Name" /></label>
          <label className={label} htmlFor="fc-email">E-Mail-Adresse *<input id="fc-email" type="email" className={`${input} ${invalid.email ? errorRing : ""}`} aria-invalid={invalid.email} aria-describedby="fc-email-hint" autoComplete="email" maxLength={254} required value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="name@firma.de" /><span id="fc-email-hint" className="mt-1 block text-xs font-normal text-slate-500">Wir nutzen die Adresse nur für Ihre Auswertung und Rückfragen.</span></label>
          <label className={label} htmlFor="fc-phone">Telefonnummer *<input id="fc-phone" type="tel" className={`${input} ${invalid.phone ? errorRing : ""}`} aria-invalid={invalid.phone} autoComplete="tel" maxLength={50} required value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+49 …" /></label>
        </div>
      </fieldset>
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-white">2 · Ihre Flotte</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={label} htmlFor="fc-count">Anzahl Fahrzeuge *<select id="fc-count" className={input} value={form.vehicleCount} onChange={(e) => set({ vehicleCount: e.target.value })}><option value="4">1–4 Fahrzeuge</option><option value="8">5–9 Fahrzeuge</option><option value="15">10–24 Fahrzeuge</option><option value="35">25–49 Fahrzeuge</option><option value="60">50–100 Fahrzeuge</option><option value="120">Über 100 Fahrzeuge</option></select></label>
          <label className={label} htmlFor="fc-process">Aktuelle Organisation *<select id="fc-process" className={input} value={form.currentProcess} onChange={(e) => set({ currentProcess: e.target.value })}><option value="Ich selbst als GF">Geschäftsführung nebenbei</option><option value="Eine Bürokraft nebenbei">Bürokraft / Assistenz nebenbei</option><option value="Unsere Fahrer selbst">Fahrer / Monteure selbst</option><option value="Niemand wirklich">Kein festes System</option></select></label>
        </div>
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-white">3 · Größte Herausforderung *</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {pains.map((pain) => (
            <label key={pain.value} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${form.mainPain === pain.value ? "border-emerald-500 bg-emerald-950/20" : "border-slate-800 bg-slate-900/40 hover:border-slate-600"}`}>
              <input type="radio" name="mainPain" value={pain.value} checked={form.mainPain === pain.value} onChange={(e) => set({ mainPain: e.target.value })} className="mt-1 accent-emerald-400" />
              <span><strong className="block text-sm text-white">{pain.label}</strong><span className="mt-1 block text-xs leading-5 text-slate-400">{pain.hint}</span></span>
            </label>
          ))}
        </div>
      </fieldset>
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label>Dieses Feld leer lassen<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set({ website: e.target.value })} /></label></div>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-400">
        <input type="checkbox" required checked={form.privacyConsent} onChange={(e) => set({ privacyConsent: e.target.checked })} className="mt-1 h-4 w-4 accent-emerald-400" />
        <span>Ich habe die <Link className="text-emerald-400 underline" href="/datenschutz" target="_blank">Datenschutzhinweise</Link> gelesen. Meine Angaben dürfen zur Bearbeitung dieses Checks verwendet werden. *</span>
      </label>
      {error && <p role="alert" aria-live="polite" className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-xl bg-emerald-400 px-6 py-4 text-sm font-extrabold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {pending ? "Wird ausgewertet …" : "Kostenlos auswerten"}
      </button>
    </form>
  );
}
