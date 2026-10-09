"use client";

import Image from "next/image";
import Link from "next/link";
import { Moon, Phone, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import CookieNotice from "@/components/cookie-notice";

type PublicContact = { businessName: string; email: string; phone: string; street: string; postalCode: string; city: string } | null;

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("lotys-theme");
    const useDark = saved ? saved === "dark" : false;
    setDark(useDark);
    document.documentElement.classList.toggle("theme-dark", useDark);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("theme-dark", next);
    localStorage.setItem("lotys-theme", next ? "dark" : "light");
  }
  return <button type="button" onClick={toggle} aria-label={dark ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"} className="lotys-theme-button">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>;
}

export default function SiteChrome({ children, contact }: { children: ReactNode; contact: PublicContact }) {
  const pathname = usePathname();
  const privatePage = ["/admin", "/dashboard", "/operations", "/login", "/kundenportal"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (privatePage) return <main id="main-content" className="lotys-staff">{children}</main>;

  const email = contact?.email || "info@lotys-mobility.de";
  const phone = contact?.phone || "+49 155 10663095";
  return <>
    <a href="#main-content" className="skip-link">Zum Inhalt springen</a>
    <header className="lotys-header">
      <div className="lotys-header-inner">
        <Link href="/" aria-label="Lotys Mobility – Startseite" className="lotys-wordmark">
          <Image src="/lotys-mark.svg" alt="Lotys Mobility" width={390} height={125} priority />
        </Link>
        <nav aria-label="Hauptnavigation" className="lotys-nav">
          <Link href="/leistungen">Leistungen</Link>
          <Link href="/ablauf">So funktioniert&apos;s</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <div className="lotys-actions">
          <ThemeToggle />
          <Link href="/kundenlogin" className="lotys-customer-login">Kundenlogin</Link>
          <Link href="/#fleet-check" className="lotys-primary-cta">Kostenloser Fuhrpark-Check</Link>
        </div>
      </div>
      <div className="lotys-mobile-nav" aria-label="Mobile Navigation">
        <Link href="/leistungen">Leistungen</Link><Link href="/ablauf">Ablauf</Link><Link href="/faq">FAQ</Link><Link href="/kundenlogin">Kundenlogin</Link><Link href="/kontakt">Kontakt</Link>
      </div>
    </header>
    <main id="main-content" className="lotys-public flex-grow">{children}</main>
    <footer className="lotys-footer">
      <div className="lotys-footer-inner">
        <section>
          <Image src="/lotys-mark.svg" alt="Lotys Mobility" width={360} height={116} className="lotys-footer-mark" />
          <p className="lotys-footer-text">Mobilität. Lösungen. Zukunft.</p>
          <p className="lotys-footer-text">Leasing & Logistik · Optimierte Lösungen · Transparenz & Vertrauen · Service mit System</p>
        </section>
        <section className="lotys-footer-links">
          <h2>Kontakt</h2>
          <a href={`tel:${phone.replace(/\s/g, "")}`}><Phone className="h-4 w-4" /> {phone}</a>
          <a href={`mailto:${email}`}>{email}</a>
          <Link href="/kontakt">Kontakt aufnehmen</Link>
          <Link href="/kundenlogin">Kundenlogin</Link>
          <Link href="/fuhrpark-check">Fuhrpark-Check</Link>
        </section>
        <section className="lotys-footer-links">
          <h2>Informationen</h2>
          <Link href="/leistungen">Leistungen</Link>
          <Link href="/ablauf">So funktioniert&apos;s</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/agb">AGB</Link>
        </section>
      </div>
      <div className="lotys-footer-bottom">© {new Date().getFullYear()} {contact?.businessName || "Lotys Mobility"} · Leistungen und Konditionen werden persönlich vereinbart.</div>
    </footer>
    <CookieNotice />
  </>;
}
