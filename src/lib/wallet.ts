const BLOCKSCOUT = "https://eth.blockscout.com/api/v2";

/**
 * fetch with an AbortController timeout so a stalled Blockscout upstream can't
 * hang the (force-dynamic) wallet page render. Mirrors the 8s timeout pattern
 * used across the rest of the codebase (binance.ts, ai.ts).
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export interface WalletBalance {
  address: string;
  balanceETH: number;
  balanceUSD: number | null;
  ensName: string | null;
}

export interface WalletTx {
  hash: string;
  from: { hash: string };
  to: { hash: string } | null;
  value: string;
  timestamp: string;
  status: string;
  method: string | null;
}

export interface WalletToken {
  token: {
    address: string;
    name: string;
    symbol: string;
    type: string;
    decimals: string | null;
  };
  value: string;
}

export async function fetchWalletBalance(address: string): Promise<WalletBalance | { error: string }> {
  try {
    const res = await fetchWithTimeout(`${BLOCKSCOUT}/addresses/${address}`, {
      next: { revalidate: 30 } as any,
    });
    if (!res.ok) return { error: "Wallet not found" };

    const data = await res.json();
    let balanceETH = 0;
    try {
      balanceETH = Number(BigInt(data.coin_balance || "0")) / 1e18;
    } catch {
      // Unexpected balance format — treat as zero rather than failing the wallet.
      balanceETH = 0;
    }
    if (!Number.isFinite(balanceETH)) balanceETH = 0;
    const ethPrice = data.exchange_rate ? Number(data.exchange_rate) : null;

    return {
      address: data.hash || address,
      balanceETH,
      balanceUSD: ethPrice ? balanceETH * ethPrice : null,
      ensName: data.ens_domain_name || null,
    };
  } catch {
    return { error: "Network error" };
  }
}

export async function fetchWalletTransactions(
  address: string,
  limit = 20
): Promise<WalletTx[]> {
  // Blockscout returns one page (~50 native txns) per call; `limit` bounds how
  // many we keep. Full history would require following next_page_params — the
  // PnL report flags incomplete history rather than silently guessing.
  const safeLimit = Math.min(Math.max(Math.trunc(limit) || 20, 1), 100);
  try {
    const res = await fetchWithTimeout(`${BLOCKSCOUT}/addresses/${address}/transactions`, {
      next: { revalidate: 30 } as any,
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: WalletTx[] = Array.isArray(data.items) ? data.items : [];
    return items.slice(0, safeLimit);
  } catch {
    return [];
  }
}

export async function fetchWalletTokens(address: string): Promise<WalletToken[]> {
  try {
    const res = await fetchWithTimeout(`${BLOCKSCOUT}/addresses/${address}/token-balances`, {
      next: { revalidate: 60 } as any,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : []).slice(0, 15);
  } catch {
    return [];
  }
}

export function isEthAddress(input: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(input.trim());
}
