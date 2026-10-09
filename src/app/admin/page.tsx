import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import AdminWorkspace from "./workspace";

export const metadata: Metadata = { title: "Seite nicht gefunden", robots: { index: false, follow: false, noarchive: true } };

export default async function AdminPage() {
  if (!(await isAdminSession())) notFound();
  return <AdminWorkspace />;
}
