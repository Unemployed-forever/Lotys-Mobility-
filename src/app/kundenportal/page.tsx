import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { organizations, tickets, vehicles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCustomerSession } from "@/lib/customer-auth";
import CustomerLogout from "./logout-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mein Fuhrpark", robots: { index: false, follow: false } };
export default async function CustomerPortal() {
  const customer = await getCustomerSession();
  if (!customer) redirect("/kundenlogin");
  const [company] = await db.select({ name: organizations.name }).from(organizations).where(eq(organizations.id, customer.organizationId)).limit(1);
  const [fleet, requests] = await Promise.all([
    db.select({ id: vehicles.id, licensePlate: vehicles.licensePlate, model: vehicles.model, nextHu: vehicles.nextHu, mileage: vehicles.mileage, status: vehicles.status }).from(vehicles).where(eq(vehicles.organizationId, customer.organizationId)).orderBy(desc(vehicles.id)),
    db.select({ id: tickets.id, licensePlate: tickets.licensePlate, issue: tickets.issue, status: tickets.status, createdAt: tickets.createdAt, customerVisibleNotes: tickets.customerVisibleNotes }).from(tickets).where(eq(tickets.organizationId, customer.organizationId)).orderBy(desc(tickets.id)).limit(30),
  ]);
  return <main className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Kundenbereich · {company?.name || "Mein Betrieb"}</p><h1 className="mt-2 text-3xl font-extrabold text-white">Guten Tag, {customer.name}</h1><p className="mt-2 text-sm text-slate-400">Ihre Fahrzeuge, Fristen und Servicevorgänge auf einen Blick.</p></div><CustomerLogout /></header>
    <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-800 bg-slate-950 p-5"><p className="text-sm text-slate-400">Fahrzeuge</p><p className="mt-2 text-3xl font-bold text-white">{fleet.length}</p></div><div className="rounded-2xl border border-slate-800 bg-slate-950 p-5"><p className="text-sm text-slate-400">Offene Vorgänge</p><p className="mt-2 text-3xl font-bold text-white">{requests.filter((item) => item.status !== "Gelöst").length}</p></div><Link href="/kundenportal/service" className="flex items-center justify-center rounded-2xl bg-emerald-400 p-5 text-center text-sm font-extrabold text-slate-950 hover:bg-emerald-300">Serviceanfrage stellen →</Link></section>
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6"><h2 className="text-xl font-bold text-white">Ihre Fahrzeugübersicht</h2>{fleet.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="text-slate-400"><tr><th className="p-3">Kennzeichen</th><th className="p-3">Fahrzeug</th><th className="p-3">HU-Monat</th><th className="p-3">Status</th></tr></thead><tbody className="divide-y divide-slate-800">{fleet.map((car) => <tr key={car.id}><td className="p-3 font-mono font-bold text-white">{car.licensePlate}</td><td className="p-3">{car.model}</td><td className="p-3">{car.nextHu}</td><td className="p-3">{car.status}</td></tr>)}</tbody></table></div> : <p className="mt-4 text-sm text-slate-400">Noch keine Fahrzeuge zugeordnet. Lotys nimmt Ihre Flotte beim Onboarding auf.</p>}</section>
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6"><h2 className="text-xl font-bold text-white">Ihre Servicevorgänge</h2>{requests.length ? <div className="mt-5 space-y-3">{requests.map((ticket) => <article key={ticket.id} className="rounded-xl border border-slate-800 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-bold text-white">#{ticket.id} · {ticket.licensePlate}</p><span className="text-xs text-emerald-300">{ticket.status}</span></div><p className="mt-2 text-sm text-slate-300">{ticket.issue}</p>{ticket.customerVisibleNotes && <p className="mt-3 text-sm text-slate-400">Lotys: {ticket.customerVisibleNotes}</p>}</article>)}</div> : <p className="mt-4 text-sm text-slate-400">Noch keine Servicevorgänge vorhanden.</p>}</section>
    <p className="text-xs text-slate-500">Dies ist kein Notruf- oder Pannendienst. Bei akuter Gefahr wählen Sie 112.</p>
  </main>;
}
