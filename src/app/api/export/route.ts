import { NextRequest, NextResponse } from "next/server";
import { getRequestTier } from "@/lib/tier";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Bulk CSV export for Pro users.
 *
 * Security:
 * - Tier is resolved SERVER-SIDE via getRequestTier() (subscription store),
 *   never trusted from the client. Free tier -> 403.
 * - Rate-limited per IP to protect the endpoint.
 * - Input is validated and CSV-escaped (formula-injection safe) — the data
 *   itself comes from the user's own localStorage and is echoed back as a file.
 */

const MAX_ROWS = 1000;

/** Escape a CSV cell and neutralise spreadsheet formula injection. */
function csvCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  // Prevent CSV formula injection (=, +, -, @, tab, CR).
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function section(title: string, headers: string[], rows: unknown[][]): string {
  const out: string[] = [];
  out.push(csvCell(title));
  out.push(headers.map(csvCell).join(","));
  for (const r of rows.slice(0, MAX_ROWS)) {
    out.push(r.map(csvCell).join(","));
  }
  out.push("");
  return out.join("\n");
}

function asArray(v: unknown): any[] {
  return Array.isArray(v) ? v : [];
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const rl = rateLimit(`export:${ip}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many export requests. Try again shortly." },
      { status: 429 }
    );
  }

  // SERVER-SIDE tier gate — the cookie is only an identity hint.
  const { tier } = await getRequestTier();
  if (tier !== "pro") {
    return NextResponse.json(
      { error: "CSV export is a Pro feature. Upgrade to unlock bulk exports." },
      { status: 403 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const holdings = asArray(body?.holdings);
  const watches = asArray(body?.watches);
  const history = asArray(body?.history);

  const parts: string[] = [];

  parts.push(
    section(
      "PORTFOLIO",
      ["Coin", "Symbol", "Amount", "Avg Cost (USD)", "Cost Basis (USD)"],
      holdings.map((h: any) => [
        h?.name,
        h?.symbol,
        h?.amount,
        h?.avgCost,
        (Number(h?.amount) || 0) * (Number(h?.avgCost) || 0),
      ])
    )
  );

  parts.push(
    section(
      "WATCH LIST",
      ["Coin", "Symbol", "Metric", "Direction", "Threshold", "Created"],
      watches.map((w: any) => [
        w?.name,
        w?.symbol,
        w?.metric,
        w?.direction,
        w?.threshold,
        w?.createdAt,
      ])
    )
  );

  parts.push(
    section(
      "ANALYSIS HISTORY",
      ["Date", "Type", "Subject", "Summary"],
      history.map((h: any) => [h?.date, h?.type, h?.subject, h?.summary])
    )
  );

  const csv =
    `CryptoFlowCheck Export\nGenerated,${csvCell(new Date().toISOString())}\n\n` +
    parts.join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cryptoflowcheck-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
