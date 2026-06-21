import { NextRequest, NextResponse } from "next/server";
import { issueAdminToken, ADMIN_COOKIE } from "@/lib/adminAuth";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/** Constant-time equality for equal-length hex digests (avoids timing leak). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// SHA-256 of the legacy password ("CryptoFlow2025!"). Used only as a fallback
// when ADMIN_PASSWORD_HASH is not set so the panel keeps working out of the box.
const DEFAULT_PASSWORD_HASH =
  "c7ef050a4efd7ab8d017e803747124a745b5c9a973c91d326d3a4136df95f1cb";

async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: NextRequest) {
  // Throttle brute-force / offline-guess attempts against the admin password.
  const limit = rateLimit(`admin-login:${getClientIP(request)}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  // Fail-closed: without a signing secret we cannot mint a tamper-proof token.
  const token = await issueAdminToken();
  if (!token) {
    return NextResponse.json(
      { error: "Admin auth is not configured (ADMIN_SECRET missing)." },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const expectedHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;
  if (!timingSafeEqual(await sha256(password), expectedHash)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
