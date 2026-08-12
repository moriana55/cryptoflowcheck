const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getSecret(): string | null {
  const secret = process.env.SUBSCRIPTION_COOKIE_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

function safeEqual(left: string, right: string): boolean {
  if (!left || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function issueSubscriptionIdentity(
  email: string,
  now = Date.now()
): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const payload = `${encodeURIComponent(normalized)}.${now + TOKEN_TTL_MS}`;
  return `${payload}.${await sign(payload, secret)}`;
}

export async function verifySubscriptionIdentity(
  token: string | null | undefined,
  now = Date.now()
): Promise<string | null> {
  const secret = getSecret();
  if (!secret || !token) return null;
  const signatureSeparator = token.lastIndexOf(".");
  const expirySeparator = token.lastIndexOf(".", signatureSeparator - 1);
  if (expirySeparator <= 0 || signatureSeparator <= expirySeparator) return null;

  const payload = token.slice(0, signatureSeparator);
  const encodedEmail = token.slice(0, expirySeparator);
  const expiry = Number(token.slice(expirySeparator + 1, signatureSeparator));
  const providedSignature = token.slice(signatureSeparator + 1);
  if (!Number.isFinite(expiry) || expiry < now) return null;
  const expectedSignature = await sign(payload, secret);
  if (!safeEqual(providedSignature, expectedSignature)) return null;

  try {
    return decodeURIComponent(encodedEmail).toLowerCase();
  } catch {
    return null;
  }
}
