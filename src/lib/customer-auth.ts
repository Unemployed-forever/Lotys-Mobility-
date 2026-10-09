import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSessionSecret } from "@/lib/auth";
import { db } from "@/db";
import { customerAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const CUSTOMER_COOKIE = "lotys_customer";
export const CUSTOMER_MAX_AGE = 60 * 60 * 8;

export function hashCustomerPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyCustomerPassword(password: string, stored: string) {
  const [salt, hex] = stored.split(":");
  if (!salt || !hex || !/^[a-f0-9]{128}$/.test(hex)) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hex, "hex");
  return timingSafeEqual(actual, expected);
}

function secret() {
  return getSessionSecret();
}

export function createCustomerToken(id: number) {
  const key = secret();
  if (!key) return null;
  const payload = Buffer.from(`customer:${id}:${Math.floor(Date.now() / 1000) + CUSTOMER_MAX_AGE}:${randomBytes(12).toString("hex")}`).toString("base64url");
  return `${payload}.${createHmac("sha256", key).update(payload).digest("base64url")}`;
}

function tokenId(token: string | undefined) {
  const key = secret();
  if (!key || !token || token.length > 1024) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = createHmac("sha256", key).update(payload).digest();
  const supplied = Buffer.from(signature, "base64url");
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  const [scope, idText, expiresText] = Buffer.from(payload, "base64url").toString("utf8").split(":");
  const id = Number(idText), expires = Number(expiresText);
  return scope === "customer" && Number.isSafeInteger(id) && id > 0 && Number.isFinite(expires) && expires > Date.now() / 1000 ? id : null;
}

async function loadCustomer(token: string | undefined) {
  const id = tokenId(token);
  if (!id) return null;
  const [account] = await db.select({ id: customerAccounts.id, organizationId: customerAccounts.organizationId, name: customerAccounts.name, email: customerAccounts.email, approved: customerAccounts.approved }).from(customerAccounts).where(eq(customerAccounts.id, id)).limit(1);
  return account?.approved ? account : null;
}

export async function getCustomerSession() {
  const store = await cookies();
  return loadCustomer(store.get(CUSTOMER_COOKIE)?.value);
}

export async function getCustomerRequest(request: Request) {
  const cookie = (request.headers.get("cookie") || "").split(";").map((v) => v.trim()).find((v) => v.startsWith(`${CUSTOMER_COOKIE}=`));
  return loadCustomer(cookie?.slice(CUSTOMER_COOKIE.length + 1));
}
