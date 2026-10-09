"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";

export default function ServiceRequestForm() {
  const [pending, setPending] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ licensePlate: "", vehicleModel: "", issue: "", priority: "Medium", contactName: "", contactPhone: "", contactEmail: "", privacyConsent: false, website: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Die Anfrage konnte nicht übermittelt werden.");
        return;
      }
      setTicketId(data.ticket?.id ?? null);
      setForm({ licensePlate: "", vehicleModel: "", issue: "", priority: "Medium", contactName: "", contactPhone: "", contactEmail: "", privacyConsent: false, website: "" });
    } catch {
      setError(typeof navigator !== "undefined" && !navigator.onLine ? "Sie scheinen offline zu sein. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut." : "Der Server ist gerade nicht erreichbar. Bitte versuchen Sie es später erneut.");
    } finally {
      setPending(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";
  const labelClass = "block text-sm font-semibold text-slate-200";

  if (ticketId) return <div role="status" aria-live="polite" className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-6 text-emerald-100"><p className="text-lg font-bold">Anfrage eingegangen</p><p className="mt-2 text-sm leading-6">Deine Vorgangsnummer lautet <strong>#{ticketId}</strong>. Das Lotys-Team prüft die Angaben und meldet sich über deine Kontaktdaten. Diese Anfrage ist keine Pannen- oder Notfallhotline.</p><button type="button" onClick={() => setTicketId(null)} className="mt-5 text-sm font-bold text-emerald-300 underline underline-offset-4">Weitere Anfrage senden</button></div>;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>Kennzeichen *<input className={inputClass} required maxLength={20} value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} placeholder="z. B. K-AB 1234" /></label>
        <label className={labelClass}>Fahrzeug / Modell *<input className={inputClass} required maxLength={100} value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} placeholder="z. B. Ford Transit" /></label>
        <label className={labelClass}>Ansprechpartner *<input className={inputClass} required maxLength={100} autoComplete="name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></label>
        <label className={labelClass}>Telefon *<input className={inputClass} required type="tel" maxLength={50} autoComplete="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} /></label>
        <label className={`${labelClass} sm:col-span-2`}>E-Mail *<input className={inputClass} required type="email" maxLength={254} autoComplete="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></label>
      </div>
      <label className={`${labelClass} block`}>Priorität
        <select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option value="Niedrig">Planbar / demnächst</option><option value="Medium">Normal</option><option value="Hoch">Dringend – Fahrzeug eingeschränkt</option><option value="Kritisch">Kritisch – Fahrzeug steht</option>
        </select>
      </label>
      <label className={`${labelClass} block`}>Was ist passiert? *
        <textarea className={inputClass} required minLength={5} maxLength={3000} rows={5} value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="Beschreibe kurz das Problem und wann du erreichbar bist. Bitte keine Gesundheitsdaten oder Führerscheindokumente übermitteln." />
      </label>
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label>Dieses Feld leer lassen<input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label></div>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-400">
        <input type="checkbox" required checked={form.privacyConsent} onChange={(e) => setForm({ ...form, privacyConsent: e.target.checked })} className="mt-1 h-4 w-4 accent-emerald-400" />
        <span>Ich habe die <Link className="text-emerald-400 underline" href="/datenschutz" target="_blank">Datenschutzhinweise</Link> gelesen. Meine Angaben dürfen zur Bearbeitung dieser Serviceanfrage verarbeitet werden. *</span>
      </label>
      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
      <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-4 text-sm font-extrabold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60 sm:w-auto"><Send className="h-4 w-4" />{pending ? "Wird übermittelt …" : "Serviceanfrage senden"}<ArrowRight className="h-4 w-4" /></button>
    </form>
  );
}
