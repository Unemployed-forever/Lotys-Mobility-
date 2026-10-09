"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LockKeyhole, ArrowLeft, ShieldCheck } from "lucide-react";

export default function LoginForm() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { configured?: boolean; authenticated?: boolean; totpEnabled?: boolean }) => {
        setConfigured(Boolean(data.configured));
        setTotpEnabled(Boolean(data.totpEnabled));
        if (data.authenticated) window.location.replace("/operations");
      })
      .catch(() => setConfigured(false));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, totp }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Anmeldung fehlgeschlagen.");
        return;
      }
      window.location.assign("/operations");
    } catch {
      setError("Der Server ist gerade nicht erreichbar. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[65vh] w-full max-w-xl items-center px-4 py-16 sm:px-6">
      <section className="w-full rounded-3xl border border-slate-800 bg-slate-950 p-7 shadow-2xl sm:p-10">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Zur Startseite
        </Link>
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Interner Bereich</p>
        <h1 className="text-3xl font-extrabold text-white">Lotys Backoffice</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Anmeldung für autorisierte Lotys-Mitarbeitende. Kunden- und Kontaktdaten sind nicht öffentlich zugänglich.</p>

        {configured === false ? (
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 text-sm leading-6 text-amber-100" role="status">
            <strong className="mb-2 block">Zugang noch nicht eingerichtet</strong>
            <p>In der Hosting-Umgebung müssen die Servervariablen <code className="rounded bg-slate-950 px-1.5 py-0.5">ADMIN_PASSWORD</code> und <code className="rounded bg-slate-950 px-1.5 py-0.5">SESSION_SECRET</code> hinterlegt werden. Das Session-Secret muss mindestens 32 Zeichen lang und zufällig sein. Danach die Anwendung neu starten.</p>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-slate-200">Admin-Passwort</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={512}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
            {totpEnabled && <div>
              <label htmlFor="admin-totp" className="mb-2 block text-sm font-semibold text-slate-200">Authenticator-Code</label>
              <input
                id="admin-totp"
                inputMode="numeric"
                pattern="[0-9]{6}"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={totp}
                onChange={(event) => setTotp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-mono tracking-[0.35em] text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                aria-describedby="admin-totp-help"
              />
              <p id="admin-totp-help" className="mt-2 text-xs text-slate-500">6-stelliger Code aus deiner Authenticator-App.</p>
            </div>}
            {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
            <button disabled={submitting || configured === null} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">
              <ShieldCheck className="h-4 w-4" /> {submitting ? "Anmeldung wird geprüft …" : "Sicher anmelden"}
            </button>
          </form>
        )}
        {configured === null && <p className="mt-5 text-center text-xs text-slate-500">Konfiguration wird geprüft …</p>}
      </section>
    </main>
  );
}
