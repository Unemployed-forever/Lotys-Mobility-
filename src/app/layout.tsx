import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteChrome from "@/components/site-chrome";
import { getLegalSettings, isLegalReady } from "@/lib/legal";
import "./globals.css";

const siteUrl = (process.env.SITE_URL?.replace(/\/$/, "") || "https://www.lotys-mobility.de").trim();
const siteDescription =
  "Lotys Mobility übernimmt die operative Fuhrparkorganisation für KMU: Werkstattkoordination, Fristenmanagement und persönliche Betreuung für Handwerk und Service.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Lotys Mobility | Fuhrparkmanagement für KMU", template: "%s | Lotys Mobility" },
  description: siteDescription,
  applicationName: "Lotys Mobility",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Lotys Mobility",
    title: "Lotys Mobility | Fuhrparkmanagement für KMU",
    description: siteDescription,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Lotys Mobility – Ihr externer Fuhrparkmanager für KMU" }],
  },
  twitter: { card: "summary_large_image", title: "Lotys Mobility | Fuhrparkmanagement für KMU", description: siteDescription, images: ["/opengraph-image"] },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const legal = await getLegalSettings();
  const contact = isLegalReady(legal) ? { businessName: legal.businessName, email: legal.email, phone: legal.phone, street: legal.street, postalCode: legal.postalCode, city: legal.city } : null;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lotys Mobility",
    url: siteUrl,
    slogan: "Ihr Fuhrparkmanager, ohne dass Sie einen einstellen müssen.",
    ...(contact ? { email: contact.email, telephone: contact.phone, address: { "@type": "PostalAddress", streetAddress: contact.street, postalCode: contact.postalCode, addressLocality: contact.city, addressCountry: "DE" } } : {}),
  };
  return <html lang="de" className="scroll-smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('lotys-theme')==='dark')document.documentElement.classList.add('theme-dark')}catch(e){}" }} />{plausibleDomain ? <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" /> : null}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} /></head><body className="flex min-h-screen flex-col bg-[#fbfbfa] font-sans text-[#171717] antialiased"><SiteChrome contact={contact}>{children}</SiteChrome></body></html>;
}
