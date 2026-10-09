import type { Metadata } from "next";
import Link from "next/link";
import FleetCheckStandaloneForm from "./form";

export const metadata: Metadata = {
  title: "Kostenloser Fuhrpark-Check",
  description: "Kostenloser Fuhrpark-Check für KMU: In 2 Minuten eine erste unverbindliche Orientierung zu Organisation, Fristen und Werkstattprozessen erhalten.",
};

export default function FleetCheckPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">100% kostenlos · In 2 Minuten ausgefüllt</p>
      <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">Kostenloser Fuhrpark-Check.</h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
        Sie erhalten eine unverbindliche erste Orientierung anhand Ihrer Angaben. Der Wert ist kein Gutachten,
        keine Rechtsberatung und keine belastbare Einsparprognose. Ihre Angaben werden nur zur Bearbeitung
        dieses Checks verwendet – Details in den <Link href="/datenschutz" className="text-emerald-400 underline">Datenschutzhinweisen</Link>.
      </p>
      <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl sm:p-10">
        <FleetCheckStandaloneForm />
      </div>
    </main>
  );
}
