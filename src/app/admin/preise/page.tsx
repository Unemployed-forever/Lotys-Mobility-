import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import InternalPricing from "./pricing";
export const metadata: Metadata = { title: "Interne Kalkulation", robots: { index: false, follow: false } };
export default async function PricingPage() { if (!(await isAdminSession())) notFound(); return <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6"><Link href="/admin" className="text-sm text-emerald-300">← Zum Control Center</Link><h1 className="mt-8 text-3xl font-extrabold text-white">Interne Angebotskalkulation</h1><p className="mt-3 text-sm text-slate-400">Nur für das Lotys-Team. Kein öffentlicher Preis und kein verbindliches Kundenangebot.</p><InternalPricing /></main>; }
