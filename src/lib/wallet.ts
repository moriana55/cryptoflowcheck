const BLOCKSCOUT = "https://eth.blockscout.com/api/v2";

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
  };
  value: string;
}

export async function fetchWalletBalance(address: string): Promise<WalletBalance | { error: string }> {
  try {
    const res = await fetch(`${BLOCKSCOUT}/addresses/${address}`, {
      next: { revalidate: 30 } as any,
    });
    if (!res.ok) return { error: "Wallet not found" };

    const data = await res.json();
    const balanceWei = BigInt(data.coin_balance || "0");
    const balanceETH = Number(balanceWei) / 1e18;
    const ethPrice = data.exchange_rate ? Number(data.exchange_rate) : null;

    return {
      address: data.hash,
      balanceETH,
      balanceUSD: ethPrice ? balanceETH * ethPrice : null,
      ensName: data.ens_domain_name || null,
    };
  } catch {
    return { error: "Network error" };
  }
}

export async function fetchWalletTransactions(address: string): Promise<WalletTx[]> {
  try {
    const res = await fetch(`${BLOCKSCOUT}/addresses/${address}/transactions?limit=20`, {
      next: { revalidate: 30 } as any,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export async function fetchWalletTokens(address: string): Promise<WalletToken[]> {
  try {
    const res = await fetch(`${BLOCKSCOUT}/addresses/${address}/token-balances`, {
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
