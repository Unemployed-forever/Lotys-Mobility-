import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description: "Hinweise zu Verträgen und Geschäftsbedingungen von Lotys Mobility für Geschäftskunden.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-20">
      <Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300">← Zur Startseite</Link>
      <h1 className="mt-8 text-4xl font-extrabold text-white">Allgemeine Geschäftsbedingungen</h1>
      <p className="mt-3 text-sm text-slate-400">Stand dieser Hinweise: Oktober 2026 · Maßgeblich ist stets die individuell geschlossene Vereinbarung.</p>
      <article className="mt-10 space-y-8 text-sm leading-7 text-slate-300">
        <section><h2 className="text-xl font-bold text-white">1. Grundsatz: Individuelle Vereinbarungen</h2><p className="mt-2">Lotys Mobility erbringt Leistungen für Unternehmen (B2B) auf Grundlage individuell geschlossener, schriftlicher Vereinbarungen. Leistungsumfang, Vergütung, Laufzeit und Kündigungsbedingungen werden darin jeweils konkret festgelegt. Allgemeine Geschäftsbedingungen des Kunden werden nur wirksam, wenn wir ihnen ausdrücklich schriftlich zustimmen.</p></section>
        <section><h2 className="text-xl font-bold text-white">2. Kein Verkauf standardisierter Pakete über die Website</h2><p className="mt-2">Alle Angaben zu Leistungen und Preisen auf dieser Website dienen der Information und stellen kein bindendes Angebot dar. Ein Vertrag kommt erst durch ein individuelles Angebot und dessen Annahme zustande.</p></section>
        <section><h2 className="text-xl font-bold text-white">3. Geschäftskunden, kein Verbraucher-Widerruf</h2><p className="mt-2">Unser Angebot richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB. Ein verbraucherrechtliches Widerrufsrecht besteht daher nicht.</p></section>
        <section><h2 className="text-xl font-bold text-white">4. Mitwirkung des Kunden</h2><p className="mt-2">Für eine ordnungsgemäße Leistungserbringung stellt der Kunde die erforderlichen Fahrzeug-, Vertrags- und Ansprechpartnerdaten rechtzeitig und zutreffend zur Verfügung und benennt eine entscheidungsbefugte Kontaktperson.</p></section>
        <section><h2 className="text-xl font-bold text-white">5. Vergütung und Zahlung</h2><p className="mt-2">Vergütung, Abrechnungszeiträume und Zahlungsziele ergeben sich aus der jeweiligen Vereinbarung. Alle genannten Preise verstehen sich, soweit nicht anders angegeben, zuzüglich der gesetzlichen Umsatzsteuer.</p></section>
        <section><h2 className="text-xl font-bold text-white">6. Vertraulichkeit und Datenschutz</h2><p className="mt-2">Beide Seiten behandeln überlassene vertrauliche Informationen vertraulich. Die Verarbeitung personenbezogener Daten richtet sich nach unserer <Link href="/datenschutz" className="text-emerald-400 underline">Datenschutzerklärung</Link> und – soweit erforderlich – einer gesonderten Auftragsverarbeitungsvereinbarung.</p></section>
        <section><h2 className="text-xl font-bold text-white">7. Kontakt</h2><p className="mt-2">Fragen zu diesen Hinweisen beantworten wir gerne über unsere <Link href="/kontakt" className="text-emerald-400 underline">Kontaktseite</Link>. Unsere Anbieterangaben finden Sie im <Link href="/impressum" className="text-emerald-400 underline">Impressum</Link>.</p></section>
      </article>
    </main>
  );
}
