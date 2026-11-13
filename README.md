# MarketIQ

**Indian Stock Market Intelligence Platform**

MarketIQ is a research and analytics workspace for NSE and BSE equities, inspired by professional financial terminals.

## Current milestone: dashboard foundation

The first release includes:
- Dark, responsive market-intelligence dashboard
- NIFTY 50, SENSEX and BANK NIFTY overview cards
- Illustrative market-performance chart
- Selected top movers
- Searchable sample stock table
- Interactive watchlist stars
- Sector performance monitor
- Responsive navigation

> **Data disclaimer:** Every price, index level, return, date and market movement currently displayed is illustrative demo data. It is not live market data and must not be used for investment decisions.

## Private deployment access

The application uses HTTP Basic Authentication. Configure the following environment variable in the hosting provider before accessing the site:

- `MARKETIQ_PASSWORD`: a strong, unique password for the private workspace.

The username is `analyst`. The site fails closed with HTTP 503 if the password is not configured, and otherwise challenges visitors for authentication. Never commit the password or market-data API keys to GitHub.

For Vercel, add `MARKETIQ_PASSWORD` under **Project → Settings → Environment Variables**, apply it to Production (and Preview if needed), then redeploy. Use a long, unique password and share it only with yourself.

## Run locally

Requirements: Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Technology

- Next.js 15
- React 19
- TypeScript
- Custom responsive CSS
- Lucide icons

## Roadmap

1. Dashboard foundation
2. Licensed NSE/BSE market-data integration
3. Interactive historical charts
4. Company financial statements and ratios
5. Stock screener and peer comparison
6. Portfolio tracking
7. AI-assisted research and valuation tools

MarketIQ is a research and analytics project, not a broker or investment-advice service.
