import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import OperationsClient from "./operations-client";

export const metadata: Metadata = { title: "Seite nicht gefunden", robots: { index: false, follow: false, noarchive: true } };

export default async function OperationsPage() {
  if (!(await isAdminSession())) notFound();
  return <OperationsClient />;
}
