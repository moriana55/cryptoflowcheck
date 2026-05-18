const STORAGE_KEY = "cfc-watchlist";

export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleWatchlist(id: string): boolean {
  const list = getWatchlist();
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(id);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return idx < 0;
}

export function isWatchlisted(id: string): boolean {
  return getWatchlist().includes(id);
}
