import { getCoinList } from "./coins";

export type Direction = "up" | "down" | "neutral";

export interface LivePrice {
  price: number;
  change24h: number;
  direction: Direction;
}

let ws: WebSocket | null = null;
const listeners = new Set<(prices: Record<string, LivePrice>) => void>();
let prices: Record<string, LivePrice> = {};
let prevPrices: Record<string, number> = {};
let connectTimer: ReturnType<typeof setTimeout> | null = null;

function getStreamsUrl() {
  const streams = getCoinList().map((c) => `${c.pair.toLowerCase()}@ticker`).join("/");
  return `wss://stream.binance.com:9443/ws/${streams}`;
}

function connect() {
  if (typeof window === "undefined") return;
  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) return;

  try {
    ws = new WebSocket(getStreamsUrl());

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle both single object and array (combined stream)
      const items = Array.isArray(data) ? data : [data];

      let updated = false;
      for (const item of items) {
        const pair = item.s as string;
        const price = Number(item.c);
        const change24h = Number(item.P);

        const prev = prevPrices[pair];
        let direction: Direction = "neutral";
        if (prev != null) {
          if (price > prev) direction = "up";
          else if (price < prev) direction = "down";
        }
        prevPrices[pair] = price;

        prices = {
          ...prices,
          [pair]: { price, change24h, direction },
        };
        updated = true;
      }

      if (updated) {
        listeners.forEach((cb) => cb(prices));
      }
    };

    ws.onerror = () => {
      ws?.close();
    };

    ws.onclose = () => {
      ws = null;
      // Reconnect after 3s
      if (connectTimer) clearTimeout(connectTimer);
      connectTimer = setTimeout(() => connect(), 3000);
    };
  } catch {
    // Ignore
  }
}

export function subscribeLivePrices(
  callback: (prices: Record<string, LivePrice>) => void
) {
  connect();
  listeners.add(callback);
  if (Object.keys(prices).length > 0) callback(prices);

  return () => {
    listeners.delete(callback);
  };
}

export function getLivePrice(pair: string): LivePrice | undefined {
  return prices[pair];
}
