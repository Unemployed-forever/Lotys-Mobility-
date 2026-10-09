"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
export default function CustomerLoginForm() {
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/customer/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Anmeldung fehlgeschlagen."); return; }
      window.location.assign("/kundenportal");
    } catch { setError("Verbindung nicht möglich. Bitte später erneut versuchen."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto flex min-h-[65vh] max-w-xl items-center px-4 py-16"><section className="w-full rounded-3xl border border-slate-800 bg-slate-950 p-7 sm:p-10"><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Lotys Kundenbereich</p><h1 className="mt-3 text-3xl font-extrabold text-white">Willkommen zurück.</h1><p className="mt-3 text-sm leading-6 text-slate-400">Der Zugang wird nach dem persönlichen Gespräch und der Einrichtung Ihres Betriebs von Lotys freigegeben. Es gibt keine öffentliche Selbstregistrierung.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-semibold text-white">E-Mail-Adresse<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white focus:border-emerald-400 focus:outline-none" /></label><label className="block text-sm font-semibold text-white">Passwort<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white focus:border-emerald-400 focus:outline-none" /></label>{error && <p role="alert" className="rounded-xl bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-emerald-400 p-3.5 font-bold text-slate-950 hover:bg-emerald-300 disabled:opacity-50">{busy ? "Wird geprüft …" : "Im Kundenportal anmelden"}</button></form><div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-slate-800 pt-5 text-sm"><Link href="/#fleet-check" className="text-emerald-300 hover:underline">Noch kein Kunde? Fuhrpark-Check →</Link><Link href="/kontakt" className="text-slate-300 hover:underline">Zugang anfragen</Link></div></section></main>;
}
