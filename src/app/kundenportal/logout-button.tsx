"use client";
export default function CustomerLogout() {
  return <button type="button" onClick={async () => { await fetch("/api/customer/logout", { method: "POST" }); window.location.assign("/kundenlogin"); }} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white">Abmelden</button>;
}
