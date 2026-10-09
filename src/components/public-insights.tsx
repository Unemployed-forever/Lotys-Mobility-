import Link from "next/link";
import { ArrowRight, ClipboardCheck, Gauge, Handshake } from "lucide-react";

const articles = [
  {
    icon: ClipboardCheck,
    title: "Fristen brauchen klare Zuständigkeiten",
    text: "HU, Wartung und Reifenwechsel werden verlässlicher, wenn Termine zentral erfasst, mit Vorlauf erinnert und einer zuständigen Person zugeordnet werden.",
    tag: "Organisation",
  },
  {
    icon: Handshake,
    title: "Werkstattkoordination statt weiterer Software",
    text: "Ein digitales System kann erinnern. Im Alltag zählen zusätzlich ein abgestimmter Werkstatttermin, eine klare Reparaturfreigabe und nachvollziehbare Rückmeldung an den Betrieb.",
    tag: "Operativer Alltag",
  },
  {
    icon: Gauge,
    title: "Erst messen, dann Einsparungen bewerten",
    text: "Kosten pro Fahrzeug, Standtage und Bearbeitungszeit bilden eine bessere Entscheidungsgrundlage als pauschale Einsparversprechen. Starten Sie mit belastbaren Ausgangswerten.",
    tag: "Transparenz",
  },
];

export default function PublicInsights() {
  return (
    <section id="wissen" className="mx-auto max-w-7xl border-t border-slate-800 px-4 pt-20 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">Wissen für Fuhrparkverantwortliche</span>
        <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Weniger Fahrzeugstress beginnt mit einem klaren Prozess.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-400">Drei praktische Ansätze, die Unternehmen helfen, Verwaltungsaufwand und Kosten transparent zu machen. Die konkrete Wirkung hängt von Ihrer Flotte und den vereinbarten Leistungen ab.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {articles.map(({ icon: Icon, title, text, tag }) => (
          <article key={title} className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:border-slate-700">
            <div className="flex items-center justify-between"><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300">{tag}</span><Icon className="h-5 w-5 text-emerald-400" aria-hidden="true" /></div>
            <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
          </article>
        ))}
      </div>
      <Link href="/kontakt" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-emerald-400 transition hover:text-emerald-300">Besprechen Sie Ihren Fuhrpark <ArrowRight className="h-4 w-4" /></Link>
    </section>
  );
}
