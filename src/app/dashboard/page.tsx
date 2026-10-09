import { isAdminSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
export default async function OldDashboard() {
  if (!(await isAdminSession())) notFound();
  redirect("/admin");
}
