import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * Subscription persistence layer.
 *
 * Schema / model for a Pro subscriber. This is intentionally a small,
 * self-contained file-backed store so it works out of the box on a single
 * instance without the owner provisioning a database. The shape and the
 * upsert API below are KV/SQL-ready: swapping the read/write helpers for
 * Vercel KV, Postgres or Redis later requires no changes at call sites.
 */
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid";

export interface SubscriptionRecord {
  /** Lower-cased email — primary key. */
  email: string;
  /** Stripe customer id (cus_...). */
  customerId?: string;
  /** Stripe subscription id (sub_...). */
  subscriptionId?: string;
  /** Current lifecycle status reported by Stripe. */
  status: SubscriptionStatus;
  /** "pro" once a paid plan is active, otherwise "free". */
  tier: "free" | "pro";
  /** Unix seconds for current period end, if known. */
  currentPeriodEnd?: number;
  /** ISO timestamp of last write. */
  updatedAt: string;
}

const DATA_DIR = join(process.cwd(), "data");
const SUBS_FILE = join(DATA_DIR, "subscriptions.json");

function ensureFile() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(SUBS_FILE)) writeFileSync(SUBS_FILE, "[]", "utf-8");
}

function readAll(): SubscriptionRecord[] {
  ensureFile();
  try {
    const raw = readFileSync(SUBS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records: SubscriptionRecord[]) {
  ensureFile();
  writeFileSync(SUBS_FILE, JSON.stringify(records, null, 2), "utf-8");
}

/** Statuses Stripe considers "the customer is currently paying". */
const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "trialing"];

/**
 * Upsert a subscription by email. The tier is derived from status so callers
 * never have to keep them in sync manually.
 */
export function upsertSubscription(
  input: Omit<SubscriptionRecord, "tier" | "updatedAt"> & {
    tier?: SubscriptionRecord["tier"];
  }
): SubscriptionRecord {
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error("upsertSubscription: email required");

  const records = readAll();
  const tier = ACTIVE_STATUSES.includes(input.status) ? "pro" : "free";

  const record: SubscriptionRecord = {
    email,
    customerId: input.customerId,
    subscriptionId: input.subscriptionId,
    status: input.status,
    tier: input.tier ?? tier,
    currentPeriodEnd: input.currentPeriodEnd,
    updatedAt: new Date().toISOString(),
  };

  const idx = records.findIndex((r) => r.email === email);
  if (idx >= 0) {
    records[idx] = { ...records[idx], ...record };
  } else {
    records.push(record);
  }
  writeAll(records);
  return record;
}

export function getSubscriptionByEmail(
  email: string
): SubscriptionRecord | undefined {
  const target = email.trim().toLowerCase();
  return readAll().find((r) => r.email === target);
}

export function getSubscriptionByCustomerId(
  customerId: string
): SubscriptionRecord | undefined {
  return readAll().find((r) => r.customerId === customerId);
}

/** True when the email currently has an active/trialing Pro subscription. */
export function isProSubscriber(email: string | null | undefined): boolean {
  if (!email) return false;
  const record = getSubscriptionByEmail(email);
  return !!record && record.tier === "pro" && ACTIVE_STATUSES.includes(record.status);
}

export function listSubscriptions(): SubscriptionRecord[] {
  return readAll();
}
