import type { Metadata } from "next";
import Link from "next/link";
import { getLegalSettings, isLegalReady } from "@/lib/legal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Impressum", description: "Anbieterkennzeichnung von Lotys Mobility." };

export default async function ImpressumPage() {
  const settings = await getLegalSettings();
  return <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-20">
    <Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300">← Zur Startseite</Link>
    <h1 className="mt-8 text-4xl font-extrabold text-white">Impressum</h1>
    {!isLegalReady(settings) ? <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 text-sm leading-7 text-amber-100" role="status">
      <h2 className="text-lg font-bold">Anbieterangaben noch nicht freigegeben</h2>
      <p className="mt-2">Die tatsächlichen, überprüften Betreiberangaben liegen dieser Website noch nicht vollständig vor. Wir zeigen bewusst keine erfundene Anschrift oder Rechtsform an. Der Betreiber muss das Impressum vor dem öffentlichen Livegang im internen Bereich vervollständigen und prüfen.</p>
    </div> : <article className="mt-10 space-y-9 text-sm leading-7 text-slate-300">
      <section><h2 className="text-xl font-bold text-white">Angaben zum Anbieter</h2><address className="mt-3 not-italic">{settings.businessName}<br />{settings.legalForm}<br />{settings.street}<br />{settings.postalCode} {settings.city}<br />{settings.country}</address></section>
      <section><h2 className="text-xl font-bold text-white">Kontakt</h2><p className="mt-3">E-Mail: <a href={`mailto:${settings.email}`} className="text-emerald-300 underline">{settings.email}</a>{settings.phone && <><br />Telefon: <a href={`tel:${settings.phone}`} className="text-emerald-300 underline">{settings.phone}</a></>}</p></section>
      {settings.representative && <section><h2 className="text-xl font-bold text-white">Vertretungsberechtigte Person</h2><p className="mt-3">{settings.representative}</p></section>}
      {settings.registryNumber && <section><h2 className="text-xl font-bold text-white">Registereintrag</h2><p className="mt-3">Registergericht: {settings.registryCourt}<br />Registernummer: {settings.registryNumber}</p></section>}
      {settings.vatId && <section><h2 className="text-xl font-bold text-white">Umsatzsteuer-Identifikationsnummer</h2><p className="mt-3">{settings.vatId}</p></section>}
      {settings.editorialResponsible && <section><h2 className="text-xl font-bold text-white">Redaktionell verantwortlich</h2><p className="mt-3">{settings.editorialResponsible}<br />{settings.street}, {settings.postalCode} {settings.city}</p></section>}
      <section><h2 className="text-xl font-bold text-white">Hinweis zu Website-Inhalten</h2><p className="mt-3">Alle Informationen zu Leistungen und Preisen dienen der Orientierung. Maßgeblich sind die individuell vereinbarten Vertragsbedingungen. Allgemeine Informationen auf dieser Website ersetzen keine rechtliche oder steuerliche Beratung.</p></section>
      <p className="border-t border-slate-800 pt-5 text-xs text-slate-500">Zuletzt vom Betreiber aktualisiert: {settings.updatedAt.toLocaleDateString("de-DE")}</p>
    </article>}
  </main>;
}
