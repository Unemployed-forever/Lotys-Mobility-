"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";

export default function ContactForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({ companyName: "", contactName: "", email: "", phone: "", subject: "", message: "", privacyConsent: false, website: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice({ kind: "error", text: data.error || "Bitte prüfen Sie Ihre Angaben." });
        return;
      }
      router.push("/danke");
      return;
    } catch {
      setNotice({ kind: "error", text: typeof navigator !== "undefined" && !navigator.onLine ? "Sie scheinen offline zu sein. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut." : "Die Anfrage konnte gerade nicht übermittelt werden. Bitte versuchen Sie es später erneut." });
    } finally {
      setPending(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";
  const labelClass = "block text-sm font-semibold text-slate-200";

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>Unternehmen (optional)
          <input className={inputClass} name="companyName" autoComplete="organization" maxLength={150} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </label>
        <label className={labelClass}>Name *
          <input className={inputClass} name="contactName" autoComplete="name" required maxLength={100} value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
        </label>
        <label className={labelClass}>Geschäftliche E-Mail *
          <input className={inputClass} name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className={labelClass}>Telefon (optional)
          <input className={inputClass} name="phone" type="tel" autoComplete="tel" maxLength={50} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
      </div>
      <label className={`${labelClass} block`}>Betreff *
        <input className={inputClass} name="subject" required maxLength={160} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      </label>
      <label className={`${labelClass} block`}>Worum geht es? *
        <textarea className={inputClass} name="message" required minLength={10} maxLength={5000} rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Zum Beispiel: Wir haben 24 Servicefahrzeuge und möchten Werkstatttermine zentral koordinieren." />
        <span className="mt-1 block text-right text-xs font-normal text-slate-500">{form.message.length}/5000</span>
      </label>
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label>Dieses Feld leer lassen<input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label>
      </div>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-400">
        <input type="checkbox" required checked={form.privacyConsent} onChange={(e) => setForm({ ...form, privacyConsent: e.target.checked })} className="mt-1 h-4 w-4 accent-emerald-400" />
        <span>Ich habe die <Link className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300" href="/datenschutz" target="_blank">Datenschutzhinweise</Link> gelesen. Meine Angaben dürfen zur Bearbeitung dieser Anfrage verwendet werden. *</span>
      </label>
      {notice && <p role={notice.kind === "error" ? "alert" : "status"} aria-live="polite" className={`rounded-xl border p-4 text-sm ${notice.kind === "success" ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-200" : "border-red-500/30 bg-red-950/30 text-red-200"}`}>{notice.text}</p>}
      <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-4 text-sm font-extrabold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        <Send className="h-4 w-4" /> {pending ? "Wird gesendet …" : "Anfrage unverbindlich senden"} <ArrowRight className="h-4 w-4" />
      </button>
      <p className="text-xs leading-5 text-slate-500">Deine Angaben verwenden wir ausschließlich zur Bearbeitung und Beantwortung deiner Anfrage. Weitere Informationen findest du in den Datenschutzhinweisen.</p>
    </form>
  );
}
