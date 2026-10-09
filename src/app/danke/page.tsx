import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getLegalSettings } from "@/lib/legal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vielen Dank für Ihre Anfrage",
  description: "Ihre Anfrage bei Lotys Mobility ist eingegangen. So geht es weiter.",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage() {
  const legal = await getLegalSettings();
  const bookingUrl = (legal as { bookingUrl?: string } | null)?.bookingUrl?.trim();
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" aria-hidden="true" />
      <h1 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">Vielen Dank!</h1>
      <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-slate-300">
        Ihre Anfrage ist bei uns eingegangen. Wir prüfen Ihr Anliegen und melden uns
        über die von Ihnen angegebenen Kontaktdaten bei Ihnen.
      </p>
      <ol className="mx-auto mt-10 max-w-md space-y-4 text-left">
        {["Wir sichten Ihre Angaben und ordnen sie dem richtigen Ansprechpartner zu.", "Sie erhalten eine persönliche Rückmeldung – in der Regel innerhalb eines Werktages.", "Gemeinsam klären wir in einem unverbindlichen Gespräch die nächsten Schritte."].map((step, i) => (
          <li key={step} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-950 font-bold text-emerald-400">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {bookingUrl ? (
          <a href={bookingUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300">
            Direkt einen Gesprächstermin wählen
          </a>
        ) : null}
        <Link href="/" className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
          Zur Startseite
        </Link>
        <Link href="/faq" className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
          Häufige Fragen
        </Link>
      </div>
    </main>
  );
}
