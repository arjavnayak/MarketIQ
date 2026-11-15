"use client";

import { useEffect, useMemo, useState } from "react";
import { nifty50Weights } from "./data/nifty50-weights";
import {
  Activity, Bell, Building2, ChartNoAxesCombined, ChevronDown, CircleHelp,
  FileText, Globe2, LayoutDashboard, Menu, Newspaper, Search, Settings2,
  SlidersHorizontal, Sparkles, Star, Wallet, X
} from "lucide-react";

type Stock = {
  symbol: string;
  company: string;
  sector: string;
};

// NIFTY 50 constituents, based on the published constituent list dated 4 Nov 2026.
const stocks: Stock[] = [
  { symbol: "ADANIENT", company: "Adani Enterprises", sector: "Metals & Mining" },
  { symbol: "ADANIPORTS", company: "Adani Ports & SEZ", sector: "Services" },
  { symbol: "APOLLOHOSP", company: "Apollo Hospitals", sector: "Healthcare" },
  { symbol: "ASIANPAINT", company: "Asian Paints", sector: "Consumer Durables" },
  { symbol: "AXISBANK", company: "Axis Bank", sector: "Financial Services" },
  { symbol: "BAJAJ-AUTO", company: "Bajaj Auto", sector: "Automobile" },
  { symbol: "BAJFINANCE", company: "Bajaj Finance", sector: "Financial Services" },
  { symbol: "BAJAJFINSV", company: "Bajaj Finserv", sector: "Financial Services" },
  { symbol: "BEL", company: "Bharat Electronics", sector: "Capital Goods" },
  { symbol: "BHARTIARTL", company: "Bharti Airtel", sector: "Telecommunication" },
  { symbol: "BSE", company: "BSE", sector: "Financial Services" },
  { symbol: "CIPLA", company: "Cipla", sector: "Healthcare" },
  { symbol: "COALINDIA", company: "Coal India", sector: "Metals & Mining" },
  { symbol: "DRREDDY", company: "Dr. Reddy's Laboratories", sector: "Healthcare" },
  { symbol: "EICHERMOT", company: "Eicher Motors", sector: "Automobile" },
  { symbol: "ETERNAL", company: "Eternal", sector: "Consumer Services" },
  { symbol: "GRASIM", company: "Grasim Industries", sector: "Construction Materials" },
  { symbol: "HCLTECH", company: "HCL Technologies", sector: "Information Technology" },
  { symbol: "HDFCBANK", company: "HDFC Bank", sector: "Financial Services" },
  { symbol: "HDFCLIFE", company: "HDFC Life Insurance", sector: "Financial Services" },
  { symbol: "HINDALCO", company: "Hindalco Industries", sector: "Metals & Mining" },
  { symbol: "HINDUNILVR", company: "Hindustan Unilever", sector: "FMCG" },
  { symbol: "ICICIBANK", company: "ICICI Bank", sector: "Financial Services" },
  { symbol: "INDIGO", company: "InterGlobe Aviation", sector: "Consumer Services" },
  { symbol: "INFY", company: "Infosys", sector: "Information Technology" },
  { symbol: "ITC", company: "ITC", sector: "FMCG" },
  { symbol: "JIOFIN", company: "Jio Financial Services", sector: "Financial Services" },
  { symbol: "JSWSTEEL", company: "JSW Steel", sector: "Metals & Mining" },
  { symbol: "KOTAKBANK", company: "Kotak Mahindra Bank", sector: "Financial Services" },
  { symbol: "LT", company: "Larsen & Toubro", sector: "Construction" },
  { symbol: "M&M", company: "Mahindra & Mahindra", sector: "Automobile" },
  { symbol: "MARUTI", company: "Maruti Suzuki India", sector: "Automobile" },
  { symbol: "MAXHEALTH", company: "Max Healthcare Institute", sector: "Healthcare" },
  { symbol: "NESTLEIND", company: "Nestle India", sector: "FMCG" },
  { symbol: "NTPC", company: "NTPC", sector: "Power" },
  { symbol: "ONGC", company: "Oil & Natural Gas Corporation", sector: "Oil, Gas & Fuels" },
  { symbol: "POWERGRID", company: "Power Grid Corporation", sector: "Power" },
  { symbol: "RELIANCE", company: "Reliance Industries", sector: "Oil, Gas & Fuels" },
  { symbol: "SBILIFE", company: "SBI Life Insurance", sector: "Financial Services" },
  { symbol: "SBIN", company: "State Bank of India", sector: "Financial Services" },
  { symbol: "SHRIRAMFIN", company: "Shriram Finance", sector: "Financial Services" },
  { symbol: "SUNPHARMA", company: "Sun Pharmaceutical Industries", sector: "Healthcare" },
  { symbol: "TATACONSUM", company: "Tata Consumer Products", sector: "FMCG" },
  { symbol: "TATASTEEL", company: "Tata Steel", sector: "Metals & Mining" },
  { symbol: "TCS", company: "Tata Consultancy Services", sector: "Information Technology" },
  { symbol: "TECHM", company: "Tech Mahindra", sector: "Information Technology" },
  { symbol: "TITAN", company: "Titan Company", sector: "Consumer Durables" },
  { symbol: "TMPV", company: "Tata Motors Passenger Vehicles", sector: "Automobile" },
  { symbol: "TRENT", company: "Trent", sector: "Consumer Services" },
  { symbol: "ULTRACEMCO", company: "UltraTech Cement", sector: "Construction Materials" }
];

const navigation = [
  { group: "WORKSPACE", items: [{ label: "Overview", icon: LayoutDashboard }, { label: "Markets", icon: Globe2 }, { label: "Watchlist", icon: Star }, { label: "Portfolio", icon: Wallet }] },
  { group: "RESEARCH", items: [{ label: "Stock screener", icon: SlidersHorizontal }, { label: "Company analysis", icon: Building2 }, { label: "Valuation", icon: ChartNoAxesCombined }, { label: "News & insights", icon: Newspaper }] }
];

export default function Dashboard() {
  const [active, setActive] = useState("Overview");
  const [search, setSearch] = useState("");
  const [moverMode, setMoverMode] = useState<"Gainers" | "Losers">("Gainers");
  const [sectorFilter, setSectorFilter] = useState("All sectors");
  const [watchlist, setWatchlist] = useState(["RELIANCE", "HDFCBANK", "INFY", "TCS"]);
  const [showAll, setShowAll] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [marketData, setMarketData] = useState<Record<string, { price: string; change: string; positive: boolean; date: string }>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [marketBreadth, setMarketBreadth] = useState<{ date: string; advances: number; declines: number; unchanged: number; total: number } | null>(null);
  const [breadthError, setBreadthError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadMarketData() {
      const results = await Promise.all(stocks.map(async (stock) => {
        try {
          const response = await fetch(`/api/market/ohlcv/${stock.symbol}`, { cache: "no-store" });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error || `TejHQ returned ${response.status} for ${stock.symbol}`);
          const rows = Array.isArray(payload.data) ? payload.data : [];
          if (rows.length === 0) throw new Error(`No TejHQ rows for ${stock.symbol}`);
          const latest = rows[rows.length - 1];
          const previous = rows.length > 1 ? rows[rows.length - 2] : null;
          const close = Number(latest.close);
          const previousClose = Number(latest.prev_close ?? previous?.close);
          if (!Number.isFinite(close) || !Number.isFinite(previousClose) || previousClose <= 0) {
            throw new Error(`Invalid price fields for ${stock.symbol}`);
          }
          const pct = ((close - previousClose) / previousClose) * 100;
          return { symbol: stock.symbol, quote: {
            price: new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(close),
            change: `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
            positive: pct >= 0,
            date: String(latest.date),
          } };
        } catch (error) {
          return { symbol: stock.symbol, error: error instanceof Error ? error.message : "Unknown data error" };
        }
      }));

      let breadth: typeof marketBreadth = null;
      let breadthMessage = "";
      try {
        const response = await fetch("/api/market/breadth", { cache: "no-store" });
        const payload = await response.json();
        if (response.ok) breadth = payload;
        else breadthMessage = payload.error || "NSE market breadth is unavailable.";
      } catch {
        breadthMessage = "Could not connect to TejHQ market snapshot.";
      }

      if (cancelled) return;
      const next: Record<string, { price: string; change: string; positive: boolean; date: string }> = {};
      const failures: string[] = [];
      for (const result of results) {
        if (result.quote) next[result.symbol] = result.quote;
        else failures.push(`${result.symbol}: ${result.error}`);
      }
      setMarketData(next);
      setMarketBreadth(breadth);
      setDataLoading(false);
      if (Object.keys(next).length === 0) setDataError(failures[0] || "TejHQ returned no stock prices.");
      else if (failures.length > 0) setDataError(`Loaded ${Object.keys(next).length} of ${stocks.length} stocks. ${failures[0]}`);
      else setDataError("");
      setBreadthError(breadthMessage);
    }
    loadMarketData();
    return () => { cancelled = true; };
  }, []);
  const liveStocks = useMemo(() => stocks.filter(stock => Boolean(marketData[stock.symbol])).map(stock => ({ ...stock, ...marketData[stock.symbol] })), [marketData]);
  const filtered = useMemo(() => stocks.map(stock => ({ ...stock, ...marketData[stock.symbol] })).filter(stock =>
    `${stock.symbol} ${stock.company} ${stock.sector}`.toLowerCase().includes(search.toLowerCase()) &&
    (active !== "Watchlist" || watchlist.includes(stock.symbol)) &&
    (sectorFilter === "All sectors" || stock.sector === sectorFilter)
  ), [marketData, search, active, watchlist, sectorFilter]);
  const moverStocks = liveStocks.filter(stock => moverMode === "Gainers" ? stock.positive : !stock.positive).slice(0, 4);
  const visible = showAll ? filtered : filtered.slice(0, 5);
  const heatmapItems = useMemo(() => {
    const items = nifty50Weights.map(item => ({
      ...item,
      stock: stocks.find(stock => stock.symbol === item.symbol),
      quote: marketData[item.symbol],
    })).filter(item => item.stock);
    return items.sort((a, b) => b.weight - a.weight);
  }, [marketData]);

  function splitHeatmap(items: typeof heatmapItems, x: number, y: number, w: number, h: number): Array<{ item: typeof heatmapItems[number]; x: number; y: number; w: number; h: number }> {
    if (items.length === 0) return [];
    if (items.length === 1) return [{ item: items[0], x, y, w, h }];
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let running = 0;
    let cut = 1;
    for (; cut < items.length; cut++) {
      running += items[cut - 1].weight;
      if (running >= total / 2) break;
    }
    const first = items.slice(0, cut);
    const firstWeight = first.reduce((sum, item) => sum + item.weight, 0);
    const ratio = firstWeight / total;
    if (w >= h) {
      const firstW = w * ratio;
      return [...splitHeatmap(first, x, y, firstW, h), ...splitHeatmap(items.slice(cut), x + firstW, y, w - firstW, h)];
    }
    const firstH = h * ratio;
    return [...splitHeatmap(first, x, y, w, firstH), ...splitHeatmap(items.slice(cut), x, y + firstH, w, h - firstH)];
  }

  const heatmapRects = splitHeatmap(heatmapItems, 0, 0, 100, 100);
  function heatColor(change?: string, positive?: boolean) {
    if (change === undefined || positive === undefined) return "#374151";
    return positive ? "#55C98A" : "#E5394F";
  }


  function toggleWatch(symbol: string) {
    setWatchlist(current => current.includes(symbol) ? current.filter(item => item !== symbol) : [...current, symbol]);
  }

  return <main className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-icon"><Activity size={19} /></div><div className="brand-word">fin<span>vex</span><small>MARKET INTELLIGENCE</small></div><button className="icon-btn close-nav" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <button className="workspace"><span className="workspace-avatar">A</span><span className="workspace-label"><b>Personal workspace</b><small>India · Equities</small></span><ChevronDown size={15} /></button>
      <nav className="nav-groups">{navigation.map(group => <div className="nav-group" key={group.group}><div className="nav-caption">{group.group}</div>{group.items.map(item => { const Icon = item.icon; return <button key={item.label} onClick={() => { setActive(item.label); setMobileNav(false); }} className={`nav-link ${active === item.label ? "active" : ""}`}><Icon size={17} /><span>{item.label}</span>{item.label === "Watchlist" && <em>{watchlist.length}</em>}</button>; })}</div>)}</nav>
      <div className="sidebar-foot"><div className="demo-state"><i /><span><b>Data integrity</b><small>No fabricated prices displayed</small></span></div><button className="nav-link"><Settings2 size={17} /><span>Settings</span></button><button className="nav-link"><CircleHelp size={17} /><span>Help & support</span></button><div className="user-card"><div className="user-avatar">AJ</div><span><b>Analyst workspace</b><small>Research account</small></span><ChevronDown size={14} /></div></div>
    </aside>
    {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
    <section className="main-area">
      <header className="topbar"><div className="top-left"><button className="icon-btn open-nav" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="crumb">Workspace <span>/</span> <b>{active}</b></div></div><div className="top-actions"><div className="market-pill"><i /> {dataLoading ? "CONNECTING TEJHQ" : Object.keys(marketData).length ? "TEJHQ · EOD DATA" : "DATA UNAVAILABLE"}</div><button className="icon-btn notification" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-user">AJ</div></div></header>
      <div className="content">
        <div className="page-title"><div><div className="eyebrow">INDIA <span>·</span> MARKET SNAPSHOT</div><h1>{active === "Overview" ? "Market overview" : active}</h1><p>Your daily view of Indian equity markets and the signals moving them.</p></div><button className="snapshot-btn">Market snapshot <ChevronDown size={14} /></button></div>
        <div className="notice"><Sparkles size={16} /><span><b>TejHQ end-of-day data.</b> NSE stock closes and market breadth are daily data, usually available the next morning. TejHQ does not provide NIFTY, SENSEX or BANK NIFTY index values.</span><button onClick={() => setActive("Company analysis")}>Explore research <span>→</span></button></div>{dataError && <div className="notice"><span>{dataError}</span></div>}{breadthError && <div className="notice"><span>{breadthError}</span></div>}


        <section className="panel heatmap-panel">
          <div className="panel-head heatmap-heading">
            <div><div className="panel-kicker">NIFTY 50 · MARKET MAP</div><h2>Market heatmap</h2><p>Box size reflects relative NIFTY 50 index weight · daily change versus previous close</p></div>
            <div className="heatmap-legend"><span><i className="legend-up" /> Gainers</span><span><i className="legend-down" /> Losers</span><span><i className="legend-na" /> Unavailable</span></div>
          </div>
          <div className="heatmap-canvas">
            {heatmapRects.map(({ item, x, y, w, h }) => {
              const quote = item.quote;
              const area = w * h;
              const compact = area < 5;
              return <div key={item.symbol} className={`heatmap-tile ${compact ? "compact" : ""}`}
                style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, background: heatColor(quote?.change, quote?.positive) }}
                title={`${item.stock?.company ?? item.symbol} · ${quote ? quote.change : "Price unavailable"} · NIFTY 50 index weight source: NSE Indices, 30 Oct 2026` }>
                <b>{item.symbol}</b>
                {!compact && <span>{quote?.change ?? "Unavailable"}</span>}
              </div>;
            })}
          </div>
          <div className="heatmap-foot"><span>Weight source: NSE Indices · NIFTY 50 constituents · 30 Oct 2026</span><span>Price source: TejHQ · EOD</span></div>
        </section>

        <section className="index-grid">
          {[
            { name: "NSE ADVANCES", value: marketBreadth?.advances, sub: "Stocks closing higher" },
            { name: "NSE DECLINES", value: marketBreadth?.declines, sub: "Stocks closing lower" },
            { name: "NSE UNCHANGED", value: marketBreadth?.unchanged, sub: "Stocks with no price change" }
          ].map(item => <article className="index-card" key={item.name}>
            <div className="index-top"><span>{item.name}</span><small><i /> TEJHQ · EOD</small></div>
            <div className="index-value">{dataLoading ? "…" : item.value?.toLocaleString("en-IN") ?? "—"}</div>
            <div className="index-change"><span>{item.sub}</span></div>
            <div className="index-foot"><span>NSE market breadth</span><span>{marketBreadth?.date ?? (breadthError ? "Unavailable" : "Waiting")}</span></div>
          </article>)}
        </section>

        <section className="primary-grid">
          <article className="panel chart-panel"><div className="panel-head"><div><div className="panel-kicker">INDEX PERFORMANCE</div><h2>NIFTY 50</h2><p>Official index feed not configured</p></div></div><div className="data-empty"><div className="data-empty-icon"><ChartNoAxesCombined size={22} /></div><b>NIFTY 50 chart unavailable</b><span>Finvex is not displaying an invented index value or chart. Historical index data will appear here once a source with suitable display rights is configured.</span></div></article>
          <article className="panel movers"><div className="panel-head"><div><div className="panel-kicker">MARKET PULSE</div><h2>Top movers</h2><p>Selected stocks · Latest daily close</p></div><button className="text-btn" onClick={() => setActive("Markets")}>View all →</button></div><div className="mover-tabs"><button className={moverMode === "Gainers" ? "chosen" : ""} onClick={() => setMoverMode("Gainers")}>Gainers</button><button className={moverMode === "Losers" ? "chosen" : ""} onClick={() => setMoverMode("Losers")}>Losers</button></div>{moverStocks.map(stock => <div className="mover-row" key={stock.symbol}><div className="stock-logo">{stock.symbol.slice(0, 1)}</div><div className="mover-name"><b>{stock.symbol}</b><small>{stock.sector}</small></div><div className="mover-quote"><b>₹{stock.price}</b><small className={stock.positive ? "up" : "down"}>{stock.change}</small></div></div>)}</article>
        </section>

        <section className="lower-grid">
          <article className="panel watch-panel"><div className="panel-head"><div><div className="panel-kicker">YOUR TRACKING</div><h2>Market watchlist</h2><p>Latest available NSE daily closing prices.</p></div><button className="add-btn" onClick={() => setShowAll(value => !value)}>{showAll ? "Show fewer" : "Browse all stocks"}</button></div><div className="table-tools"><div className="search-box"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search stocks..." /></div><select className="filter-btn" aria-label="Filter by sector" value={sectorFilter} onChange={event => setSectorFilter(event.target.value)}><option>All sectors</option>{Array.from(new Set(stocks.map(stock => stock.sector))).map(sector => <option key={sector}>{sector}</option>)}</select></div><div className="table-scroll"><table><thead><tr><th>COMPANY</th><th>SECTOR</th><th className="align-right">LAST PRICE</th><th className="align-right">CHANGE</th><th /></tr></thead><tbody>{visible.map(stock => <tr key={stock.symbol}><td><div className="company-cell"><div className="stock-logo">{stock.symbol.slice(0, 1)}</div><span><b>{stock.symbol}</b><small>{stock.company}</small></span></div></td><td><span className="sector-tag">{stock.sector}</span></td><td className="align-right mono">{stock.price ? `₹${stock.price}` : "—"}</td><td className={`align-right mono ${stock.positive === undefined ? "" : stock.positive ? "up" : "down"}`}>{stock.change ?? "Unavailable"}</td><td className="align-right"><button className={`star-btn ${watchlist.includes(stock.symbol) ? "starred" : ""}`} onClick={() => toggleWatch(stock.symbol)} aria-label={watchlist.includes(stock.symbol) ? "Remove from watchlist" : "Add to watchlist"}><Star size={15} fill={watchlist.includes(stock.symbol) ? "currentColor" : "none"} /></button></td></tr>)}</tbody></table>{visible.length === 0 && <div className="empty">No stocks match your search.</div>}</div><div className="table-foot"><span>{active === "Watchlist" ? "Your watchlist" : "Showing"} {visible.length} of {filtered.length} companies · {dataLoading ? "Loading prices…" : "TejHQ daily close"}</span><button onClick={() => setShowAll(value => !value)}>{showAll ? "Show less" : "View all stocks"} →</button></div></article>
          <article className="panel sectors"><div className="panel-head"><div><div className="panel-kicker">SECTOR MONITOR</div><h2>Sector performance</h2><p>Waiting for verified sector-level data</p></div></div><div className="data-empty sector-empty"><div className="data-empty-icon"><Globe2 size={22} /></div><b>Sector returns unavailable</b><span>Sector performance will be calculated from verified constituent prices. No sample returns are shown.</span></div></article>
        </section>

        <section className="research-grid"><article className="panel research-card"><div className="research-icon"><Sparkles size={18} /></div><div><div className="panel-kicker">COMING NEXT</div><h3>AI research analyst</h3><p>Company deep-dives, financial statement interpretation and valuation insights in one workflow.</p></div><button onClick={() => setActive("Company analysis")}>Explore →</button></article><article className="panel research-card"><div className="research-icon violet"><FileText size={18} /></div><div><div className="panel-kicker">RESEARCH DESK</div><h3>Company intelligence</h3><p>Track quarterly results, key ratios, cash flows and long-term financial performance.</p></div><button onClick={() => setActive("Company analysis")}>Explore →</button></article></section>
        <footer className="footer"><span>FINVEX <b>·</b> BUILT FOR BETTER RESEARCH</span><span>Private workspace · TejHQ end-of-day stock data</span><span>India <Globe2 size={12} /></span></footer>
      </div>
    </section>
  </main>;
}
