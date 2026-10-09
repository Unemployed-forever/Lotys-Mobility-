"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ClipboardList, LogOut, Mail, MessageSquareText, RefreshCw, Save, ShieldCheck, Truck, Wrench } from "lucide-react";

type Tab = "tickets" | "leads" | "contacts";
interface Ticket { id: number; licensePlate: string; vehicleModel: string; issue: string; priority: string; status: string; contactName: string; contactPhone: string; contactEmail: string; adminNotes: string; createdAt: string; }
interface FleetCheck { id: number; companyName: string; contactName: string; email: string; phone: string; vehicleCount: number; currentProcess: string; mainPain: string; calculatedScore: number; createdAt: string; }
interface ContactMessage { id: number; companyName: string; contactName: string; email: string; phone: string; subject: string; message: string; status: string; createdAt: string; }

const statusOptions = ["Neu", "In Prüfung", "Werkstatt koordiniert", "Gelöst"];
const baseInput = "w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400";

export default function OperationsClient() {
  const [tab, setTab] = useState<Tab>("tickets");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [leads, setLeads] = useState<FleetCheck[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [status, setStatus] = useState("Neu");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ticketResponse, leadResponse, contactResponse] = await Promise.all([
        fetch("/api/tickets", { cache: "no-store" }),
        fetch("/api/fleet-checks", { cache: "no-store" }),
        fetch("/api/contact", { cache: "no-store" }),
      ]);
      if ([ticketResponse, leadResponse, contactResponse].some((response) => response.status === 401)) {
        window.location.assign("/login?next=%2Foperations");
        return;
      }
      if (![ticketResponse, leadResponse, contactResponse].every((response) => response.ok)) throw new Error("Backoffice-Daten konnten nicht vollständig geladen werden.");
      const [ticketData, leadData, contactData] = await Promise.all([ticketResponse.json(), leadResponse.json(), contactResponse.json()]);
      setTickets(ticketData);
      setLeads(leadData);
      setMessages(contactData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verbindungsfehler beim Laden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function beginEdit(ticket: Ticket) {
    setEditing(ticket.id);
    setStatus(ticket.status);
    setNotes(ticket.adminNotes || "");
  }

  async function saveTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/tickets", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing, status, adminNotes: notes }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ticket konnte nicht aktualisiert werden.");
      setEditing(null);
      setNotice(`Ticket #${data.id} wurde gespeichert.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ticket konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  async function updateMessage(message: ContactMessage, nextStatus: string) {
    setError("");
    try {
      const response = await fetch("/api/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: message.id, status: nextStatus }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Nachrichtenstatus konnte nicht geändert werden.");
      setMessages((items) => items.map((item) => item.id === message.id ? { ...item, status: data.status } : item));
      setNotice(`Kontaktanfrage #${message.id}: ${data.status}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Statusänderung fehlgeschlagen.");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  const openTickets = tickets.filter((ticket) => ticket.status !== "Gelöst").length;
  const unreadMessages = messages.filter((message) => message.status === "Neu").length;

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-400"><ShieldCheck className="h-4 w-4" /> Interner Bereich · angemeldet</span>
          <h1 className="mt-3 text-3xl font-extrabold text-white">Lotys Backoffice</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Tickets, Fuhrpark-Check-Anfragen und Kontakt-Nachrichten an einem Ort. Kundendaten sind nur nach Anmeldung abrufbar.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-300">Control Center</Link>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-900 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Aktualisieren</button>
          <button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:border-red-500/50 hover:text-red-200"><LogOut className="h-4 w-4" /> Abmelden</button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Übersicht">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5"><p className="text-sm text-slate-400">Offene Tickets</p><p className="mt-2 text-3xl font-black text-white">{loading ? "–" : openTickets}</p></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5"><p className="text-sm text-slate-400">Fuhrpark-Check-Leads</p><p className="mt-2 text-3xl font-black text-emerald-400">{loading ? "–" : leads.length}</p></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5"><p className="text-sm text-slate-400">Neue Kontaktanfragen</p><p className="mt-2 text-3xl font-black text-amber-300">{loading ? "–" : unreadMessages}</p></div>
      </section>

      {error && <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
      {notice && <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-sm text-emerald-200"><CheckCircle2 className="h-5 w-5 shrink-0" />{notice}</div>}

      <nav className="flex flex-wrap gap-2 border-b border-slate-800 pb-3" aria-label="Backoffice-Bereiche">
        <TabButton active={tab === "tickets"} onClick={() => setTab("tickets")} icon={<Wrench className="h-4 w-4" />}>Tickets ({tickets.length})</TabButton>
        <TabButton active={tab === "leads"} onClick={() => setTab("leads")} icon={<Truck className="h-4 w-4" />}>Fuhrpark-Checks ({leads.length})</TabButton>
        <TabButton active={tab === "contacts"} onClick={() => setTab("contacts")} icon={<MessageSquareText className="h-4 w-4" />}>Kontaktanfragen ({messages.length})</TabButton>
      </nav>

      {loading ? <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center text-sm text-slate-400"><RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-emerald-400" />Daten werden geladen …</div> : (
        <>
          {tab === "tickets" && <section className="space-y-4" aria-label="Service-Tickets">
            {tickets.length === 0 ? <EmptyState text="Es sind noch keine Service-Tickets eingegangen." /> : tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-slate-900 px-2.5 py-1 font-mono text-sm font-bold text-white">{ticket.licensePlate}</span><span className="text-sm text-slate-300">{ticket.vehicleModel}</span><span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">{ticket.status}</span><span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{ticket.priority}</span></div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">{ticket.issue}</p>
                    <p className="mt-3 text-xs text-slate-400">Kontakt: {ticket.contactName} · <a className="text-emerald-300 underline" href={`tel:${ticket.contactPhone}`}>{ticket.contactPhone}</a> · <a className="text-emerald-300 underline" href={`mailto:${ticket.contactEmail}`}>{ticket.contactEmail}</a></p>
                    {ticket.adminNotes && <p className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm leading-6 text-slate-300"><strong className="text-emerald-300">Interne Statusnotiz:</strong> {ticket.adminNotes}</p>}
                  </div>
                  <button type="button" onClick={() => beginEdit(ticket)} className="shrink-0 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-300">Bearbeiten</button>
                </div>
                {editing === ticket.id && <form onSubmit={saveTicket} className="mt-5 grid gap-4 border-t border-slate-800 pt-5 md:grid-cols-[0.7fr_1.3fr_auto] md:items-end">
                  <label className="text-xs font-bold text-slate-400">Status<select className={`${baseInput} mt-2`} value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                  <label className="text-xs font-bold text-slate-400">Notiz für Kunden- und/oder Operationsverlauf<textarea className={`${baseInput} mt-2`} rows={3} maxLength={8000} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
                  <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Speichert …" : "Speichern"}</button>
                </form>}
              </article>
            ))}
          </section>}

          {tab === "leads" && <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950" aria-label="Fuhrpark-Check-Leads">
            <div className="border-b border-slate-800 p-5"><h2 className="text-lg font-bold text-white">Eingegangene Fuhrpark-Checks</h2><p className="mt-1 text-sm text-slate-400">Orientierungswert nur als Gesprächsauftakt verwenden; kein Gutachten oder objektiver Compliance-Score.</p></div>
            {leads.length === 0 ? <EmptyState text="Noch keine Checks eingegangen." /> : <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-slate-900 text-xs uppercase text-slate-400"><tr><th className="p-4">Unternehmen</th><th className="p-4">Kontakt</th><th className="p-4">Flotte</th><th className="p-4">Verwaltung</th><th className="p-4">Herausforderung</th><th className="p-4">Orientierung</th></tr></thead><tbody className="divide-y divide-slate-800">{leads.map((lead) => <tr key={lead.id} className="align-top text-slate-300"><td className="p-4 font-semibold text-white">{lead.companyName}<span className="mt-1 block text-xs font-normal text-slate-500">{new Date(lead.createdAt).toLocaleDateString("de-DE")}</span></td><td className="p-4">{lead.contactName}<a className="mt-1 block text-xs text-emerald-300 underline" href={`mailto:${lead.email}`}>{lead.email}</a><a className="mt-1 block text-xs text-emerald-300 underline" href={`tel:${lead.phone}`}>{lead.phone}</a></td><td className="p-4">{lead.vehicleCount}</td><td className="p-4">{lead.currentProcess}</td><td className="p-4">{lead.mainPain}</td><td className="p-4">{lead.calculatedScore}/100</td></tr>)}</tbody></table></div>}
          </section>}

          {tab === "contacts" && <section className="space-y-4" aria-label="Kontaktanfragen">
            {messages.length === 0 ? <EmptyState text="Es sind noch keine Kontaktanfragen eingegangen." /> : messages.map((message) => <article key={message.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-white">{message.subject}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${message.status === "Neu" ? "bg-amber-500/10 text-amber-300" : "bg-slate-800 text-slate-300"}`}>{message.status}</span></div><p className="mt-1 text-xs text-slate-500">{new Date(message.createdAt).toLocaleString("de-DE")}</p><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">{message.message}</p><p className="mt-4 text-sm text-slate-400">{message.contactName}{message.companyName ? ` · ${message.companyName}` : ""}</p><div className="mt-2 flex flex-wrap gap-4 text-sm"><a className="inline-flex items-center gap-1.5 text-emerald-300 underline" href={`mailto:${message.email}`}><Mail className="h-4 w-4" />{message.email}</a>{message.phone && <a className="text-emerald-300 underline" href={`tel:${message.phone}`}>{message.phone}</a>}</div></div>
                <div className="flex shrink-0 flex-wrap gap-2">{message.status === "Neu" && <button type="button" onClick={() => void updateMessage(message, "Gesehen")} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900">Als gesehen markieren</button>}{message.status !== "Erledigt" && <button type="button" onClick={() => void updateMessage(message, "Erledigt")} className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-300">Erledigt</button>}</div>
              </div>
            </article>)}
          </section>}
        </>
      )}
      <footer className="border-t border-slate-800 pt-5 text-xs text-slate-500">Datensparsam arbeiten: Kundenunterlagen nicht unnötig exportieren. Zugriffe und Aufbewahrungsfristen regelmäßig prüfen. <Link href="/" className="ml-2 text-emerald-400 underline">Öffentliche Website</Link></footer>
    </main>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: ReactNode; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${active ? "bg-emerald-400 text-slate-950" : "border border-slate-800 text-slate-300 hover:bg-slate-900"}`}>{icon}{children}</button>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center text-sm text-slate-400"><ClipboardList className="mx-auto mb-3 h-7 w-7 text-slate-600" />{text}</div>;
}
