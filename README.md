# CryptoFlowCheck

Real-time cryptocurrency intelligence dashboard with on-chain scanner, whale tracking, and alpha flow signals.

## Features

- Live crypto price tracking via Binance API
- Coin comparison with side-by-side metrics
- Market intelligence feed
- Interactive price charts (via Lightweight Charts)
- Fear & Greed Index
- Security Radar

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `GET /api/coins` - List coins with 24h ticker data
- `GET /api/coins/[id]` - Detailed coin data with 7d/30d change and ATH/ATL
- `GET /api/coins/market-chart?ids=bitcoin,ethereum&days=30` - Historical price data (CoinGecko)

## Environment Variables

Copy `.env.example` to `.env.local` and adjust if needed.

## Disclaimer

The information provided is for informational purposes only. Not Financial Advice (NFA). Trade at your own risk.
