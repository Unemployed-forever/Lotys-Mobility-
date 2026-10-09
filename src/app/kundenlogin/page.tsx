import type { Metadata } from "next";
import CustomerLoginForm from "./form";
export const metadata: Metadata = { title: "Kundenlogin", robots: { index: false, follow: false } };
export default function CustomerLoginPage() { return <CustomerLoginForm />; }
