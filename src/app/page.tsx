"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandFilm from "@/components/brand-film";
import PublicInsights from "@/components/public-insights";
import { 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Settings, 
  TrendingUp, 
  Wrench, 
  Clock, 
  FileText, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  X,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  Play,
  Briefcase,
  BookOpen
} from "lucide-react";

interface FleetCheckResult {
  id: number;
  companyName: string;
  vehicleCount: number;
  calculatedScore: number;
  recommendations: string;
  createdAt: string;
}

export default function LandingPage() {
  // Calculator State
  const [vehicleCount, setVehicleCount] = useState<number>(20);
  const [currentProcess, setCurrentProcess] = useState<string>("Bürokraft nebenbei");
  
  // Fleet Check (Lead Magnet) State
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    vehicleCount: "20",
    currentProcess: "Ich selbst als GF",
    mainPain: "Werkstattrechnungen zu hoch/ungeprüft",
    privacyConsent: false,
    website: "",
  });
  const [isSubmittingCheck, setIsSubmittingCheck] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<FleetCheckResult | null>(null);
  const [checkError, setCheckError] = useState("");
  const [stepError, setStepError] = useState("");
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const firstStepRender = useRef(true);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (firstStepRender.current) { firstStepRender.current = false; return; }
    stepHeadingRef.current?.focus({ preventScroll: true });
  }, [step]);

  // Unverbindliche Zeit- und Prozessannahmen ohne öffentliche Preisangaben.
  const monthlyHoursSaved = Number(((vehicleCount * 10) / 60 + 3).toFixed(1));
  const assumedHourlyCost = currentProcess === "Ich selbst als GF" ? 45 : currentProcess === "Monteure selbst" ? 35 : 25;
  const modeledTimeValue = Math.round(monthlyHoursSaved * assumedHourlyCost);

  // Handle lead magnet submission
  const handleCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckError("");
    setIsSubmittingCheck(true);

    try {
      const res = await fetch("/api/fleet-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          vehicleCount: parseInt(formData.vehicleCount) || 15,
          currentProcess: formData.currentProcess,
          mainPain: formData.mainPain,
          privacyConsent: formData.privacyConsent,
          website: formData.website,
        }),
      });

      if (res.ok) {
        const resultData = await res.json();
        setCheckResult(resultData);
        setStep(4); // Advance to results page
      } else {
        const err = await res.json();
        setCheckError(err.error || "Es gab ein Problem. Bitte prüfen Sie Ihre Angaben.");
      }
    } catch {
      setCheckError(typeof navigator !== "undefined" && !navigator.onLine ? "Sie scheinen offline zu sein. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut." : "Netzwerkfehler bei der Übermittlung. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmittingCheck(false);
    }
  };

  // Diagnostic recommendation splitting helper
  const getRecList = (recStr: string) => {
    if (!recStr) return [];
    return recStr.split("|");
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 pt-16 pb-24 md:pt-24 md:pb-32 border-b border-slate-900">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Externer Fuhrparkleiter für KMU</span>
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Ihr Fuhrparkmanager, ohne dass Sie einen <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">einstellen müssen</span>.
              </h1>
              
              <p className="text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Wir koordinieren Werkstätten, prüfen Rechnungen, überwachen Fristen und nehmen Ihrem Team den gesamten operativen Fahrzeugaufwand ab. 
                <strong className="text-white block mt-2">Weniger Abstimmung. Mehr Einsatzbereitschaft.</strong>
              </p>

              {/* USP Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300 max-w-xl mx-auto lg:mx-0 pt-2">
                <div className="flex items-center space-x-2 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kein teures Eigenpersonal nötig</span>
                </div>
                <div className="flex items-center space-x-2 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Rechnungsprüfung nach abgestimmten Kriterien</span>
                </div>
                <div className="flex items-center space-x-2 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Fristen und Zuständigkeiten transparent koordinieren</span>
                </div>
                <div className="flex items-center space-x-2 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unabhängig von Autohäusern & Leasing</span>
                </div>
              </div>

              {/* Main CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link 
                  href="#fleet-check" 
                  className="w-full sm:w-auto px-8 py-4 text-center rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-400/20 active:scale-95 transition-all text-base"
                >
                  Kostenloser Fuhrpark-Check
                </Link>
                <Link 
                  href="/kontakt" 
                  className="w-full sm:w-auto px-8 py-4 text-center rounded-xl font-bold text-white bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all text-base flex items-center justify-center gap-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Persönliches Erstgespräch anfragen
                </Link>
              </div>

              <p className="pt-5 text-xs text-slate-400">Datenschutz wird bei allen digitalen Abläufen mitgedacht. Konkrete Verarbeitung und Rechte finden Sie in unseren Datenschutzhinweisen.</p>
            </div>

            <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/90 p-7 shadow-2xl sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Ein Ansprechpartner. Klare Abläufe.</p>
              <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">Mehr Zeit für das, was Ihr Unternehmen wirklich bewegt.</h2>
              <div className="mt-8 space-y-5 text-sm text-slate-300">
                <p className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />Werkstatttermine und Rückfragen werden koordiniert.</p>
                <p className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />Fahrzeugfristen und Aufgaben bleiben im Blick.</p>
                <p className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />Sie erhalten transparente Rückmeldungen statt noch eines Logins.</p>
              </div>
              <Link href="/leistungen" className="mt-9 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 px-5 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-950">Unsere Leistungen kennenlernen <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      <BrandFilm />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/70 to-slate-950 p-8 sm:p-12">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Lotys Mobility</p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Ihre Monteure arbeiten. Ihre Fahrzeuge fahren.<br /><span className="text-emerald-400">Wir kümmern uns um den Rest.</span></h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">Starten Sie mit dem kostenlosen Fuhrpark-Check oder vereinbaren Sie direkt ein unverbindliches Gespräch.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="#fleet-check" className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950">Fuhrpark-Check starten</Link><Link href="/kontakt" className="rounded-xl border border-slate-600 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800">Gespräch vereinbaren</Link></div>
        </div>
      </section>

      {/* VALUE PROP COMPARED - LOTYS VS SOFTWARE VS INTERNAL STAFF */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Software verlangt Logins. <span className="text-emerald-400">Lotys löst das Problem.</span>
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Digitale Tools können Fahrzeugdaten und Termine übersichtlich abbilden. Lotys ergänzt — sofern vertraglich vereinbart — die operative Koordination, dokumentierte Rückmeldungen und abgestimmte Freigabeprozesse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Software Alone */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Reine Fuhrpark-Software</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Software kann Fahrzeugdaten und Fristen übersichtlich abbilden. Ob und wie sie mit Werkstätten, Verträgen und Abläufen zusammenspielt, hängt vom jeweiligen Anbieter und Setup ab.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-900">
              <li className="flex items-center space-x-2 text-red-400">
                <X className="w-4 h-4 shrink-0" />
                <span>Hoher eigener Arbeitsaufwand</span>
              </li>
              <li className="flex items-center space-x-2 text-red-400">
                <X className="w-4 h-4 shrink-0" />
                <span>Keine aktive Werkstattsteuerung</span>
              </li>
              <li className="flex items-center space-x-2 text-red-400">
                <X className="w-4 h-4 shrink-0" />
                <span>Keine technische Rechnungsprüfung</span>
              </li>
            </ul>
          </div>

          {/* Column 2: Lotys (Winner) */}
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-6 relative overflow-hidden space-y-4 shadow-xl shadow-emerald-950/20">
            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] uppercase font-black px-3 py-1 rounded-bl-lg tracking-wider">
              Beste Option für KMU
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Lotys Mobility Services
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">Steuerung</span>
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Verbindet digitale Übersicht mit <strong>vereinbarter operativer Unterstützung</strong>. Lotys koordiniert Termine, dokumentiert Rückmeldungen und prüft Angebote nach dem abgestimmten Prozess.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-200 pt-2 border-t border-emerald-950">
              <li className="flex items-center space-x-2 text-emerald-400">
                <Check className="w-4 h-4 shrink-0" />
                <span>0 Minuten Aufwand für Sie im Alltag</span>
              </li>
              <li className="flex items-center space-x-2 text-emerald-400">
                <Check className="w-4 h-4 shrink-0" />
                <span>Aktives Schadens- & Reifenmanagement</span>
              </li>
              <li className="flex items-center space-x-2 text-emerald-400">
                <Check className="w-4 h-4 shrink-0" />
                <span>Rechnungsprüfung anhand vereinbarter Kriterien (Einsparungen nicht garantiert)</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Internal Manager */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Eigener Fuhrparkleiter</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ein eigener Fuhrparkmanager verursacht feste Personalkosten. Ob sich eine interne Stelle lohnt, hängt von Flottengröße, Aufgaben und vorhandenen Rollen ab.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-900">
              <li className="flex items-center space-x-2 text-red-400">
                <X className="w-4 h-4 shrink-0" />
                <span>Enorme feste Personalkosten</span>
              </li>
              <li className="flex items-center space-x-2 text-red-400">
                <X className="w-4 h-4 shrink-0" />
                <span>Ausfallrisiko (Krankheit/Urlaub)</span>
              </li>
              <li className="flex items-center space-x-2 text-red-400">
                <X className="w-4 h-4 shrink-0" />
                <span>Einstellung & Training zeitintensiv</span>
              </li>
            </ul>
          </div>

        </div>
      </section>


      {/* INTERACTIVE ESTIMATOR & TCO CALCULATOR */}
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Calculator Left: Inputs */}
            <div className="lg:col-span-6 p-8 sm:p-12 space-y-8 bg-slate-900/40">
              <div>
                <span className="text-emerald-400 font-mono text-xs uppercase tracking-wider block mb-2">Fuhrpark-Potenzialrechner</span>
                <h2 className="text-3xl font-extrabold text-white">
                  Wie viel Zeit bindet Ihr Fuhrpark?
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Passen Sie die Flottengröße an. Wir zeigen Ihnen eine unverbindliche Modellannahme für den internen Koordinationsaufwand.
                </p>
              </div>

              {/* Vehicle Count Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label htmlFor="calc-count" className="text-sm font-semibold text-slate-200">
                    Anzahl Ihrer Fahrzeuge (Pkw, Transporter, Lkw; Beispielkalkulation):
                  </label>
                  <span className="text-2xl font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-4 py-1.5 rounded-lg">
                    {vehicleCount} Fahrzeuge
                  </span>
                </div>
                <input 
                  id="calc-count"
                  type="range" 
                  min="5" 
                  max="100" 
                  value={vehicleCount} 
                  onChange={(e) => setVehicleCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-xs text-slate-500" aria-hidden="true">
                  <span>5</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Current Process Dropdown */}
              <div className="space-y-2">
                <label htmlFor="calc-process" className="text-sm font-semibold text-slate-200">
                  Wer verwaltet den Fuhrpark aktuell bei Ihnen?
                </label>
                <select 
                  id="calc-process"
                  value={currentProcess} 
                  onChange={(e) => setCurrentProcess(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Ich selbst als GF">Geschäftsführer / Inhaber persönlich (ca. 45 €/Std. interner Satz)</option>
                  <option value="Bürokraft nebenbei">Büroassistenz / Assistenz nebenbei (Fehlende Kfz-Fachkenntnis)</option>
                  <option value="Monteure selbst">Monteure melden Probleme selbst</option>
                  <option value="Niemand wirklich">Kein festes System (keine zentrale Dokumentation)</option>
                </select>
              </div>

              {/* Key Business insights alert box */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 flex items-start space-x-3 text-xs text-slate-400">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-400 block mb-0.5">Wussten Sie schon?</strong>
                  Pflichten rund um Fahrzeugnutzung und Fahrerlaubnis hängen vom Einzelfall ab. Lotys kann vereinbarte Erinnerungs- und Dokumentationsprozesse unterstützen; Rechtsberatung oder eine Garantie der Rechtskonformität ersetzt das nicht.
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 border-t border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 p-8 sm:p-12 lg:border-l lg:border-t-0">
              <h3 className="border-b border-slate-800 pb-4 text-xl font-bold text-white">Was Sie heute selbst koordinieren</h3>
              <p className="mt-5 text-sm leading-7 text-slate-400">Der Rechner zeigt beispielhafte interne Aufwände — keine zugesagte Einsparung und keinen Lotys-Angebotspreis. Ein konkretes Angebot entsteht erst nach unserem Gespräch.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><Clock className="h-5 w-5 text-emerald-400" /><p className="mt-3 text-xs text-slate-400">Modellierter Koordinationsaufwand</p><strong className="mt-2 block text-2xl text-white">{monthlyHoursSaved} Std. / Monat</strong><p className="mt-2 text-xs text-slate-500">Annahme: 10 Minuten je Fahrzeug + 3 Stunden Grundaufwand.</p></div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><Calculator className="h-5 w-5 text-emerald-400" /><p className="mt-3 text-xs text-slate-400">Indikativer interner Zeitwert</p><strong className="mt-2 block text-2xl text-white">~{modeledTimeValue.toLocaleString("de-DE")} € / Monat</strong><p className="mt-2 text-xs text-slate-500">{monthlyHoursSaved} Std. × {assumedHourlyCost} €/Std. · keine Einsparungszusage.</p></div>
              </div>
              <Link href="/kontakt" className="mt-8 block rounded-xl bg-emerald-400 px-6 py-4 text-center text-sm font-bold text-slate-950 hover:bg-emerald-300">Individuelle Einschätzung anfragen</Link>
            </div>
          </div>
        </div>
      </section>


      {/* INTERACTIVE LEAD MAGNET: KOSTENLOSER FUHRPARK-CHECK */}
      <section id="fleet-check" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-8">
            
            {/* Form Header */}
            <div className="text-center space-y-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide border border-emerald-500/20">
                100% Kostenlos | In 2 Minuten ausgefüllt
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                Kostenloser Lotys Fuhrpark-Check (Pilot 2026)
              </h2>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                Erhalten Sie eine unverbindliche erste Orientierung anhand Ihrer Angaben. Der Score ist kein Gutachten, keine Rechtsberatung und keine belastbare Einsparprognose.
              </p>
            </div>

            {/* Steps indicator */}
            {step < 4 && (
              <nav aria-label="Fortschritt des Fuhrpark-Checks" className="flex items-center justify-center space-x-4 pb-4">
                <div aria-current={step === 1 ? "step" : undefined} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>1</div>
                <div className="h-px w-8 bg-slate-800" aria-hidden="true"></div>
                <div aria-current={step === 2 ? "step" : undefined} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>2</div>
                <div className="h-px w-8 bg-slate-800" aria-hidden="true"></div>
                <div aria-current={step === 3 ? "step" : undefined} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>3</div>
              </nav>
            )}

            {/* FORM MULTI-STEP */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-semibold text-white border-b border-slate-800 pb-2 outline-none">Schritt 1: Unternehmensdaten</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="fc-home-company" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Firma / Betrieb: *</label>
                    <input 
                      id="fc-home-company"
                      type="text" 
                      placeholder="Name des Betriebs" 
                      required
                      maxLength={150}
                      autoComplete="organization"
                      aria-invalid={!!stepError && !formData.companyName.trim()}
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl p-3.5 text-sm text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="fc-home-name" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Ansprechpartner(in): *</label>
                    <input 
                      id="fc-home-name"
                      type="text" 
                      placeholder="Ihr Name" 
                      required
                      maxLength={100}
                      autoComplete="name"
                      aria-invalid={!!stepError && !formData.contactName.trim()}
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl p-3.5 text-sm text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="fc-home-email" className="text-xs font-bold text-slate-400 uppercase tracking-wide">E-Mail-Adresse: *</label>
                    <input 
                      id="fc-home-email"
                      type="email" 
                      placeholder="z.B. a.schmidt@schmidt-shk.de" 
                      required
                      maxLength={254}
                      autoComplete="email"
                      aria-invalid={!!stepError && !emailPattern.test(formData.email.trim())}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl p-3.5 text-sm text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="fc-home-phone" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Telefonnummer (für Rückfragen): *</label>
                    <input 
                      id="fc-home-phone"
                      type="tel" 
                      placeholder="z.B. +49 172 1234567" 
                      required
                      maxLength={50}
                      autoComplete="tel"
                      aria-invalid={!!stepError && !formData.phone.trim()}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl p-3.5 text-sm text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                {stepError && <p role="alert" aria-live="polite" className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">{stepError}</p>}

                <div className="flex justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      if (!formData.companyName.trim() || !formData.contactName.trim() || !emailPattern.test(formData.email.trim()) || !formData.phone.trim()) {
                        setStepError("Bitte füllen Sie alle Kontaktdaten aus und prüfen Sie das E-Mail-Format.");
                        return;
                      }
                      setStepError("");
                      setStep(2);
                    }}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <span>Weiter zu Schritt 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-semibold text-white border-b border-slate-800 pb-2 outline-none">Schritt 2: Flottenstärke & Verwaltung</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label htmlFor="fc-home-count" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Wie viele Fahrzeuge betreuen Sie?</label>
                    <select 
                      id="fc-home-count"
                      value={formData.vehicleCount}
                      onChange={(e) => setFormData({...formData, vehicleCount: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-300 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="4">1 - 4 Fahrzeuge (Klein)</option>
                      <option value="8">5 - 9 Fahrzeuge (Übergangsgröße)</option>
                      <option value="15">10 - 24 Fahrzeuge (Sweet Spot Reibung)</option>
                      <option value="35">25 - 49 Fahrzeuge (Sehr attraktiv für Lotys)</option>
                      <option value="60">50 - 100 Fahrzeuge (Erhöhter Administrationsaufwand)</option>
                      <option value="120">Mehr als 100 Fahrzeuge</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fc-home-process" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Wie wird der Fuhrpark aktuell organisiert?</label>
                    <select 
                      id="fc-home-process"
                      value={formData.currentProcess}
                      onChange={(e) => setFormData({...formData, currentProcess: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-300 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Ich selbst als GF">Ich selbst als Geschäftsführer nebenbei</option>
                      <option value="Eine Bürokraft nebenbei">Eine Bürokraft / Assistenz nebenbei</option>
                      <option value="Unsere Fahrer selbst">Unsere Monteure / Fahrer machen das selbst</option>
                      <option value="Niemand wirklich">Gar kein festes System vorhanden</option>
                    </select>
                  </div>

                </div>

                <div className="flex justify-between pt-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold transition-colors"
                  >
                    Zurück
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <span>Weiter zu Schritt 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleCheckSubmit} className="space-y-6">
                <h3 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-semibold text-white border-b border-slate-800 pb-2 outline-none">Schritt 3: Ihre größte Herausforderung</h3>
                
                <div className="space-y-4">
                  <span id="fc-home-pain-label" className="text-sm font-semibold text-slate-200 block">
                    Welches Problem raubt Ihnen im Alltag die meiste Zeit / Nerven?
                  </span>
                  
                  <div role="radiogroup" aria-labelledby="fc-home-pain-label" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <label className={`border rounded-2xl p-4 flex items-start space-x-3 cursor-pointer transition-all ${formData.mainPain === 'Werkstattrechnungen zu hoch/ungeprüft' ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-850 hover:border-slate-700 bg-slate-900/40'}`}>
                      <input 
                        type="radio" 
                        name="mainPain" 
                        value="Werkstattrechnungen zu hoch/ungeprüft" 
                        checked={formData.mainPain === "Werkstattrechnungen zu hoch/ungeprüft"}
                        onChange={(e) => setFormData({...formData, mainPain: e.target.value})}
                        className="mt-1 accent-emerald-400"
                      />
                      <div>
                        <strong className="text-white text-xs block">Rechnungen ungeprüft</strong>
                        <span className="text-[11px] text-slate-400">Werkstattrechnungen steigen stark an und werden einfach so bezahlt.</span>
                      </div>
                    </label>

                    <label className={`border rounded-2xl p-4 flex items-start space-x-3 cursor-pointer transition-all ${formData.mainPain === 'Termine (HU/Service) vergessen' ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-850 hover:border-slate-700 bg-slate-900/40'}`}>
                      <input 
                        type="radio" 
                        name="mainPain" 
                        value="Termine (HU/Service) vergessen" 
                        checked={formData.mainPain === "Termine (HU/Service) vergessen"}
                        onChange={(e) => setFormData({...formData, mainPain: "Termine (HU/Service) vergessen"})}
                        className="mt-1 accent-emerald-400"
                      />
                      <div>
                        <strong className="text-white text-xs block">Fristen & compliance</strong>
                        <span className="text-[11px] text-slate-400">HU/AU verpasst, Führerscheinkontrollen unklar, Halterhaftung wackelig.</span>
                      </div>
                    </label>

                    <label className={`border rounded-2xl p-4 flex items-start space-x-3 cursor-pointer transition-all ${formData.mainPain === 'Fahrzeug-Ausfallzeiten kosten Geld' ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-850 hover:border-slate-700 bg-slate-900/40'}`}>
                      <input 
                        type="radio" 
                        name="mainPain" 
                        value="Fahrzeug-Ausfallzeiten kosten Geld" 
                        checked={formData.mainPain === "Fahrzeug-Ausfallzeiten kosten Geld"}
                        onChange={(e) => setFormData({...formData, mainPain: e.target.value})}
                        className="mt-1 accent-emerald-400"
                      />
                      <div>
                        <strong className="text-white text-xs block">Stillstandzeiten</strong>
                        <span className="text-[11px] text-slate-400">Ausgefallene Transporter blockieren Monteure, was hohen Schaden anrichtet.</span>
                      </div>
                    </label>

                    <label className={`border rounded-2xl p-4 flex items-start space-x-3 cursor-pointer transition-all ${formData.mainPain === 'Schadenabwicklung chaotisch' ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-850 hover:border-slate-700 bg-slate-900/40'}`}>
                      <input 
                        type="radio" 
                        name="mainPain" 
                        value="Schadenabwicklung chaotisch" 
                        checked={formData.mainPain === "Schadenabwicklung chaotisch"}
                        onChange={(e) => setFormData({...formData, mainPain: e.target.value})}
                        className="mt-1 accent-emerald-400"
                      />
                      <div>
                        <strong className="text-white text-xs block">Chaos bei Schäden</strong>
                        <span className="text-[11px] text-slate-400">Kratzer, Unfälle & Reifenprobleme werden nur ad-hoc und ungeordnet gelöst.</span>
                      </div>
                    </label>

                  </div>
                </div>

                <label className="flex items-start gap-3 text-xs leading-5 text-slate-400">
                  <input type="checkbox" required checked={formData.privacyConsent} onChange={(e) => setFormData({...formData, privacyConsent: e.target.checked})} className="mt-1 h-4 w-4 accent-emerald-400" />
                  <span>Ich habe die <Link href="/datenschutz" className="text-emerald-400 underline" target="_blank">Datenschutzhinweise</Link> gelesen. Meine Angaben dürfen zur Bearbeitung dieses Checks verwendet werden. *</span>
                </label>
                <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label>Dieses Feld leer lassen<input tabIndex={-1} autoComplete="off" name="website" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} /></label></div>

                {checkError && <p role="alert" aria-live="polite" className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">{checkError}</p>}

                <div className="flex justify-between pt-4 border-t border-slate-900">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold transition-colors"
                  >
                    Zurück
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmittingCheck}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-emerald-400/10"
                  >
                    {isSubmittingCheck ? (
                      <span>Wird analysiert...</span>
                    ) : (
                      <>
                        <span>Auswerten & Score berechnen!</span>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: DIAGNOSTIC REPORT RESULTS */}
            {step === 4 && checkResult && (
              <div className="space-y-6 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 animate-fadeIn">
                
                <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-slate-800 gap-4">
                  <div>
                    <h3 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-white outline-none">Analyse-Auswertung für {checkResult.companyName}</h3>
                    <p className="text-xs text-slate-400">Registriert am {new Date(checkResult.createdAt).toLocaleDateString("de-DE")} | ID: #{checkResult.id}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">IHR FUHRPARK-SCORE:</span>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl border-4 ${
                      checkResult.calculatedScore > 75 
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400' 
                        : checkResult.calculatedScore > 50 
                        ? 'border-yellow-500 bg-yellow-950/40 text-yellow-400' 
                        : 'border-red-500 bg-red-950/40 text-red-400'
                    }`}>
                      {checkResult.calculatedScore}
                    </div>
                  </div>
                </div>

                {/* Score badge / explanation */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className={`w-5 h-5 ${checkResult.calculatedScore < 60 ? 'text-red-400' : 'text-yellow-400'}`} />
                    <span className="text-sm font-bold text-white">Unverbindliche Orientierung:</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      checkResult.calculatedScore > 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {checkResult.calculatedScore > 75 ? 'eher geringe organisatorische Reibung' : checkResult.calculatedScore > 50 ? 'mögliche Standardisierungspotenziale' : 'möglicherweise mehr Abstimmungsbedarf'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dieser unverbindliche Orientierungswert basiert nur auf Ihren Angaben zu Flottengröße und aktueller Organisation. Er ersetzt keine Prüfung mit echten Fahrzeug-, Kosten- und Prozessdaten.
                  </p>
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Individueller Lotys-Handlungsplan (3 Punkte):
                  </h4>
                  
                  <div className="space-y-3">
                    {getRecList(checkResult.recommendations).map((rec: string, i: number) => (
                      <div key={i} className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex items-start space-x-3 text-xs">
                        <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Next Step */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-white">Nächster Schritt mit Lotys:</h5>
                    <p className="text-[11px] text-slate-400">Leistungsumfang, Preis und Pilotdauer stimmen wir transparent mit Ihrem Betrieb ab.</p>
                  </div>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setStep(1)} 
                      className="w-1/2 sm:w-auto text-xs px-4 py-2 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                    >
                      Neuer Check
                    </button>
                    <Link 
                      href="/kontakt"
                      className="w-1/2 sm:w-auto text-xs px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-center transition-colors"
                    >
                      Gespräch vereinbaren
                    </Link>
                  </div>
                </div>

              </div>
            )}


          </div>
        </div>
      </section>


      <PublicInsights />


      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center sm:p-12"><h2 className="text-3xl font-extrabold text-white">Ein Angebot, das zu Ihrem Fuhrpark passt.</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">Wir besprechen Fahrzeugzahl, Aufgaben und Freigabewege persönlich. Erst danach erhalten Sie ein konkretes Angebot — ohne öffentliche Pauschalpreise.</p><Link href="/kontakt" className="mt-7 inline-block rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950">Gespräch vereinbaren</Link></div></section>

    </div>
  );
}
