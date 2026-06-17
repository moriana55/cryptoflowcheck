"use client";

import { useEffect, useState } from "react";

export interface TierState {
  tier: "free" | "pro";
  isPro: boolean;
  email: string | null;
  loading: boolean;
}

/**
 * Resolve the current request's tier from the server (/api/tier). The server
 * re-derives the tier from the persisted subscription store, so the client can
 * use `isPro` purely for UX (showing/locking UI). All real enforcement still
 * happens server-side in the relevant route handlers.
 */
export function useTier(): TierState {
  const [state, setState] = useState<TierState>({
    tier: "free",
    isPro: false,
    email: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    fetch("/api/tier")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setState({
          tier: d.tier === "pro" ? "pro" : "free",
          isPro: Boolean(d.isPro),
          email: d.email ?? null,
          loading: false,
        });
      })
      .catch(() => {
        if (active) setState((s) => ({ ...s, loading: false }));
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
