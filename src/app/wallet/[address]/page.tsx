import { fetchWalletBalance, fetchWalletTransactions, fetchWalletTokens, isEthAddress } from "@/lib/wallet";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import WalletClient from "./WalletClient";
import { getRequestTier } from "@/lib/tier";
import { computeWalletPnlReport } from "@/lib/walletPnl";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  return {
    title: `Wallet ${address.slice(0, 6)}...${address.slice(-4)} | CryptoFlowCheck`,
    description: `Ethereum wallet analysis for ${address}`,
  };
}

export default async function WalletPage({ params }: Props) {
  const { address } = await params;

  if (!isEthAddress(address)) {
    notFound();
  }

  const [balance, transactions, tokens] = await Promise.all([
    fetchWalletBalance(address),
    fetchWalletTransactions(address),
    fetchWalletTokens(address),
  ]);

  if ("error" in balance) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-20 text-center">
        <h1 className="font-geist text-headline-md text-error mb-4">Wallet Not Found</h1>
        <p className="text-on-surface-variant">{balance.error}</p>
      </div>
    );
  }

  // PnL / tax report is a Pro feature: the full report is only computed and
  // sent to the client for Pro users (server-verified). Free users get a teaser.
  const { tier } = await getRequestTier();
  const pnl = tier === "pro" ? await computeWalletPnlReport(address) : null;

  return (
    <WalletClient
      balance={balance}
      transactions={transactions}
      tokens={tokens}
      tier={tier}
      pnl={pnl}
    />
  );
}
