/**
 * Server-side admin auth hardening.
 *
 * The legacy cookie was a static string ("authenticated") that anyone could
 * set in their browser. This module issues an HMAC-signed token bound to a
 * server-only secret (ADMIN_SECRET) and an expiry, so the cookie can no longer
 * be forged without the secret.
 *
 * Uses WebCrypto (crypto.subtle) so it runs in both the Edge (middleware) and
 * Node.js runtimes.
 *
 * Fail-closed: if ADMIN_SECRET is not configured, no token can be issued and
 * every verification returns false.
 */

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export const ADMIN_COOKIE = "cfc-admin";

function getSecret(): string | null {
  return process.env.ADMIN_SECRET || null;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return toHex(sig);
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Issue a signed admin token: `<expiryMs>.<hexHmac>`.
 * Returns null when ADMIN_SECRET is missing (fail-closed).
 */
export async function issueAdminToken(now = Date.now()): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const expiry = String(now + TOKEN_TTL_MS);
  const sig = await hmac(expiry, secret);
  return `${expiry}.${sig}`;
}

/**
 * Verify a signed admin token. Returns false on any tampering, expiry, or
 * when ADMIN_SECRET is not configured.
 */
export async function verifyAdminToken(
  token: string | undefined | null,
  now = Date.now()
): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) return false;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  const expiryStr = token.slice(0, dot);
  const providedSig = token.slice(dot + 1);

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < now) return false;

  const expectedSig = await hmac(expiryStr, secret);
  return safeEqual(providedSig, expectedSig);
}
