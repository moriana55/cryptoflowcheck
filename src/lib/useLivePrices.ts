"use client";

import { useEffect, useState } from "react";
import { subscribeLivePrices, getLivePrice, type LivePrice } from "./livePrices";

export function useLivePrices() {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});

  useEffect(() => {
    return subscribeLivePrices(setPrices);
  }, []);

  return prices;
}

export function useLivePrice(pair: string): LivePrice | undefined {
  const [price, setPrice] = useState<LivePrice | undefined>(() =>
    getLivePrice(pair)
  );

  useEffect(() => {
    return subscribeLivePrices((all) => {
      if (all[pair]) setPrice(all[pair]);
    });
  }, [pair]);

  return price;
}
