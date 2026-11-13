# MarketIQ

**Indian Stock Market Intelligence Platform**

MarketIQ is a private research and analytics workspace for Indian equities, inspired by professional financial terminals.

## Current status

The dashboard foundation includes:
- Responsive dark market-intelligence interface
- Searchable NSE stock watchlist with saved-in-session watchlist toggles
- Gainers and losers view based only on prices returned by the configured data endpoint
- NSE advances, declines and unchanged cards when a valid market snapshot is available
- Explicit unavailable-data states for index charts and sector returns
- Private workspace access through HTTP Basic Authentication

**Data integrity:** The application must not display invented stock prices, index levels, charts or sector returns. If a data source is unavailable, the dashboard should show an unavailable state instead.

## Market-data restrictions

The current TejHQ integration provides end-of-day NSE stock data. Its free-data terms restrict use to private personal dashboards and do not establish permission to display or redistribute the data on a public product. Keep MarketIQ private while using this source. Do not enable public access or redistribute raw market data unless the relevant provider and exchange display rights explicitly permit it.

TejHQ does not supply official NIFTY 50, SENSEX or BANK NIFTY index values through the current integration. Those charts remain unavailable until a suitable data source is approved.

## Private access

The application uses HTTP Basic Authentication. Configure the environment variable `MARKETIQ_PASSWORD` in the hosting provider before accessing the site.

- Username: `analyst`
- Password: a strong, unique value stored only as an environment variable.

The site fails closed with HTTP 503 if the password is not configured. Never commit the password or market-data API keys to GitHub.

For Vercel, add `MARKETIQ_PASSWORD` under **Project → Settings → Environment Variables**, apply it to the required environments, then redeploy.

## Run locally

Requirements: Node.js 20.9 or later.

Set `MARKETIQ_PASSWORD` in your local environment, then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The browser will request the Basic Auth credentials.

## Build validation

GitHub Actions is configured to install dependencies and run `npm run build` on pushes and pull requests targeting `main`.

## Technology

- Next.js 15
- React 19
- TypeScript
- Custom responsive CSS
- Lucide icons

## Roadmap

1. Stable private dashboard and automated build checks
2. Market-data provider with clear public-display rights
3. Interactive historical stock and index charts
4. Company financial statements, ratios and peer comparison
5. Stock screener and valuation tools
6. Portfolio tracking
7. AI-assisted research and valuation workflows

MarketIQ is a research tool, not a broker or investment-advice service.
