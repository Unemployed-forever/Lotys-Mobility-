import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import ContactForm from "./contact-form";
import { getLegalSettings } from "@/lib/legal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontakt & Fuhrpark-Check | Lotys Mobility",
  description: "Besprechen Sie unverbindlich, wie Lotys Mobility Ihren betrieblichen Fuhrpark organisieren kann. Antwort auf Ihre Anfrage über das Lotys-Team.",
};

export default async function ContactPage() {
  const legal = await getLegalSettings();
  const bookingUrl = (legal as { bookingUrl?: string } | null)?.bookingUrl?.trim() || "";
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Zur Startseite</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <section className="space-y-6">
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">Unverbindlich · B2B · Persönlich</span>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">Lass uns über deinen Fuhrpark sprechen.</h1>
          <p className="max-w-xl text-lg leading-8 text-slate-300">Schreib uns, wie viele Fahrzeuge du betreust und wo der Alltag hakt. Wir klären gemeinsam, ob ein Fuhrpark-Check oder ein Pilot sinnvoll ist.</p>
          <div className="space-y-4 border-t border-slate-800 pt-6 text-sm text-slate-300">
            <p className="flex items-start gap-3"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /><span><strong className="text-white">Kein Verkaufsdruck.</strong><br />Erst verstehen wir euren Ablauf, dann sprechen wir über ein passendes Angebot.</span></p>
            <p className="flex items-start gap-3"><MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /><span><strong className="text-white">Klare nächste Schritte.</strong><br />Auf Wunsch folgt ein 30–45-minütiges Erstgespräch zum Fuhrpark.</span></p>
            <p className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /><span><strong className="text-white">Datensparsam.</strong><br />Bitte keine Kennzeichen, Führerscheine oder Fahrzeugdokumente in das Kontaktformular eintragen.</span></p>
          </div>
          {bookingUrl ? (
            <a href={bookingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300">
              Direkt einen Gesprächstermin wählen <ArrowRight className="h-4 w-4" />
            </a>
          ) : null}
          <Link href="/kundenlogin" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300">Bereits Kunde? Zum Kundenlogin <ArrowRight className="h-4 w-4" /></Link>
        </section>
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl sm:p-9">
          <h2 className="mb-2 text-2xl font-bold text-white">Kontakt aufnehmen</h2>
          <p className="mb-7 text-sm text-slate-400">Die mit * markierten Felder sind erforderlich.</p>
          <ContactForm />
        </section>
      </div>
    </main>
  );
}
