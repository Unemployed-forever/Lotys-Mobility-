import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import CustomerManagement from "./management";
export const metadata: Metadata = { title: "Kundenzugänge", robots: { index: false, follow: false } };
export default async function CustomerManagementPage() {
  if (!(await isAdminSession())) notFound();
  const companies = await db.select({ id: organizations.id, name: organizations.name }).from(organizations);
  return <CustomerManagement organizations={companies} />;
}
