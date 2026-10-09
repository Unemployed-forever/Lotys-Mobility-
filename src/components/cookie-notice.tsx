"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "lotys-cookie-info";

/**
 * Hinweis statt Consent-Banner: Die Website setzt keine Analyse- oder
 * Marketing-Cookies, daher ist keine Tracking-Einwilligung erforderlich.
 * Nur technisch notwendige Session-Cookies (nach Login) werden verwendet.
 */
export default function CookieNotice() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);
  if (!visible) return null;
  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }
  return (
    <div role="region" aria-label="Hinweis zu Cookies" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs leading-6 text-slate-300">
          Wir verwenden <strong className="text-white">keine Tracking- oder Werbe-Cookies</strong>. Nur nach einer
          Anmeldung wird ein technisch notwendiges Session-Cookie gesetzt. Details in der{" "}
          <Link href="/datenschutz" className="text-emerald-400 underline">Datenschutzerklärung</Link>.
        </p>
        <button type="button" onClick={dismiss} className="shrink-0 rounded-lg bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-300">
          Verstanden
        </button>
      </div>
    </div>
  );
}
