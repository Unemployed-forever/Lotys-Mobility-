import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import LegalEditor from "./legal-editor";

export const metadata: Metadata = { title: "Seite nicht gefunden", robots: { index: false, follow: false } };
export default async function LegalAdminPage() {
  if (!(await isAdminSession())) notFound();
  return <LegalEditor />;
}
