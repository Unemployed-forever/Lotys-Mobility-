import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import ServiceRequestForm from "@/app/service-anfrage/service-request-form";

export const metadata: Metadata = { title: "Serviceanfrage", robots: { index: false, follow: false } };
export default async function CustomerServicePage() {
  const customer = await getCustomerSession();
  if (!customer) redirect("/kundenlogin");
  return <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6"><Link href="/kundenportal" className="text-sm text-emerald-300">← Zum Kundenportal</Link><section className="mt-7 rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-9"><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Kundenservice</p><h1 className="mt-2 text-3xl font-extrabold text-white">Fahrzeugproblem melden</h1><p className="my-6 text-sm text-slate-400">Bitte die Störung schildern. Die Anfrage wird automatisch Ihrem Betrieb zugeordnet. Diese Seite ist keine 24/7-Pannenhilfe.</p><ServiceRequestForm /></section></main>;
}
