import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "lotys_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
let derivedSecret: { source: string; value: string } | null = null;

/**
 * Prefer an explicit SESSION_SECRET (≥ 32 chars). If the hosting environment does not
 * provide one, derive a stable signing key from ADMIN_PASSWORD via scrypt so logins keep
 * working after restarts. Changing the admin password then invalidates all sessions.
 */
export function getSessionSecret() {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 32) return explicit;
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) return null;
  if (derivedSecret?.source !== password) {
    derivedSecret = { source: password, value: scryptSync(password, "lotys-session-signing-v1", 32).toString("hex") };
  }
  return derivedSecret.value;
}

function sessionSecret() {
  return getSessionSecret();
}

export function isAdminAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && sessionSecret());
}

export function isTotpEnabled() {
  return Boolean(process.env.ADMIN_TOTP_SECRET);
}

function stringsMatch(a: string, b: string) {
  const aDigest = createHash("sha256").update(a).digest();
  const bDigest = createHash("sha256").update(b).digest();
  return timingSafeEqual(aDigest, bDigest);
}

function decodeBase32(value: string) {
  const normalized = value.toUpperCase().replace(/[^A-Z2-7]/g, "");
  if (!normalized) return null;
  let bits = "";
  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) return null;
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  return Buffer.from(bytes);
}

function totpForCounter(secret: Buffer, counter: number) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", secret).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code = ((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).toString().padStart(6, "0");
  return code;
}

export function verifyAdminTotp(candidate: string) {
  const rawSecret = process.env.ADMIN_TOTP_SECRET;
  if (!rawSecret) return true;
  if (!/^\d{6}$/.test(candidate)) return false;
  const secret = decodeBase32(rawSecret);
  if (!secret) return false;
  const currentCounter = Math.floor(Date.now() / 1000 / 30);
  for (const drift of [-1, 0, 1]) {
    if (stringsMatch(candidate, totpForCounter(secret, currentCounter + drift))) return true;
  }
  return false;
}

export function verifyAdminPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !isAdminAuthConfigured()) return false;
  return stringsMatch(candidate, expected);
}

export function createAdminSessionToken() {
  const secret = sessionSecret();
  if (!secret) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = Buffer.from(`v1:${expiresAt}:${randomBytes(18).toString("base64url")}`).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  const secret = sessionSecret();
  if (!secret || !token || token.length > 1024) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  const expectedSignature = createHmac("sha256", secret).update(payload).digest();
  let providedSignature: Buffer;
  try { providedSignature = Buffer.from(signature, "base64url"); } catch { return false; }
  if (providedSignature.length !== expectedSignature.length || !timingSafeEqual(expectedSignature, providedSignature)) return false;
  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const [version, expiresAtText, nonce] = decoded.split(":");
    const expiresAt = Number(expiresAtText);
    return version === "v1" && Boolean(nonce) && Number.isFinite(expiresAt) && expiresAt > Math.floor(Date.now() / 1000);
  } catch { return false; }
}

export function isAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`));
  return verifyAdminSessionToken(cookie?.slice(ADMIN_COOKIE_NAME.length + 1));
}

export async function isAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export const ADMIN_SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
