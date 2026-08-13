const LOCAL_ORIGIN = "https://cryptoflowcheck.local";

export function getSafeComparisonHref(
  candidate: string,
  allowedExchangeIds: ReadonlySet<string>
): string | null {
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.length > 200) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate, LOCAL_ORIGIN);
  } catch {
    return null;
  }
  if (parsed.origin !== LOCAL_ORIGIN || parsed.pathname !== "/compare/exchanges") {
    return null;
  }
  if ([...parsed.searchParams.keys()].some((key) => key !== "a" && key !== "b")) {
    return null;
  }

  const first = parsed.searchParams.get("a");
  const second = parsed.searchParams.get("b");
  if (!first || !second || !allowedExchangeIds.has(first) || !allowedExchangeIds.has(second)) {
    return null;
  }
  return `/compare/exchanges?a=${encodeURIComponent(first)}&b=${encodeURIComponent(second)}`;
}
