import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">404</p>
      <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">
        Diese Seite gibt es leider nicht.
      </h1>
      <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-400">
        Vielleicht wurde die Adresse falsch geschrieben oder die Seite ist umgezogen.
        Hier finden Sie weiter:
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
        >
          Zur Startseite
        </Link>
        <Link
          href="/leistungen"
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Leistungen
        </Link>
        <Link
          href="/kontakt"
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Kontakt
        </Link>
      </div>
    </main>
  );
}
