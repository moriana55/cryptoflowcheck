/**
 * Lightweight client-side log of analyses the user has run (e.g. AI compare
 * insights, coin views). Used to populate the "Analysis History" section of the
 * Pro CSV export. Capped to the most recent entries. Pure localStorage.
 */

export interface AnalysisEntry {
  date: string;
  type: string;
  subject: string;
  summary: string;
}

const KEY = "cfc-analysis-history";
const MAX = 200;

function email(): string {
  if (typeof document === "undefined") return "anon";
  const m = document.cookie.match(/(?:^|;\s*)cfc-user-email=([^;]+)/);
  if (m) {
    try {
      return decodeURIComponent(m[1]).toLowerCase() || "anon";
    } catch {
      return "anon";
    }
  }
  return "anon";
}

function storageKey(): string {
  return `${KEY}:${email()}`;
}

export function getAnalysisHistory(): AnalysisEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordAnalysis(entry: Omit<AnalysisEntry, "date">) {
  if (typeof window === "undefined") return;
  const list = getAnalysisHistory();
  list.unshift({ ...entry, date: new Date().toISOString() });
  localStorage.setItem(storageKey(), JSON.stringify(list.slice(0, MAX)));
}
