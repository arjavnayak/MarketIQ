"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, Building2, ChartNoAxesCombined,
  ChevronDown, CircleHelp, FileText, Globe2, LayoutDashboard, Menu, Newspaper,
  Search, Settings2, SlidersHorizontal, Sparkles, Star, Wallet, X
} from "lucide-react";

type Stock = {
  symbol: string;
  company: string;
  sector: string;
  price: string;
  change: string;
  positive: boolean;
};

const indices = [
  { name: "NIFTY 50", value: "24,854.05", change: "+0.82%", positive: true, sub: "NSE · Benchmark", points: "0,39 14,33 28,37 42,23 56,28 70,18 84,25 98,11 112,17 126,6" },
  { name: "SENSEX", value: "81,330.20", change: "+0.74%", positive: true, sub: "BSE · Benchmark", points: "0,35 14,29 28,33 42,22 56,26 70,14 84,21 98,10 112,15 126,5" },
  { name: "BANK NIFTY", value: "56,218.40", change: "-0.21%", positive: false, sub: "NSE · Banking", points: "0,8 14,14 28,10 42,22 56,17 70,28 84,23 98,34 112,29 126,39" }
];

const stocks: Stock[] = [
  { symbol: "RELIANCE", company: "Reliance Industries", sector: "Energy", price: "1,284.50", change: "+2.41%", positive: true },
  { symbol: "HDFCBANK", company: "HDFC Bank", sector: "Banking", price: "1,746.20", change: "+1.82%", positive: true },
  { symbol: "ICICIBANK", company: "ICICI Bank", sector: "Banking", price: "1,298.75", change: "+1.56%", positive: true },
  { symbol: "INFY", company: "Infosys", sector: "IT", price: "1,862.30", change: "-0.84%", positive: false },
  { symbol: "TCS", company: "Tata Consultancy Services", sector: "IT", price: "3,924.10", change: "-0.42%", positive: false },
  { symbol: "BHARTIARTL", company: "Bharti Airtel", sector: "Telecom", price: "1,642.80", change: "+1.12%", positive: true }
];

const navigation = [
  { group: "WORKSPACE", items: [{ label: "Overview", icon: LayoutDashboard }, { label: "Markets", icon: Globe2 }, { label: "Watchlist", icon: Star }, { label: "Portfolio", icon: Wallet }] },
  { group: "RESEARCH", items: [{ label: "Stock screener", icon: SlidersHorizontal }, { label: "Company analysis", icon: Building2 }, { label: "Valuation", icon: ChartNoAxesCombined }, { label: "News & insights", icon: Newspaper }] }
];

function Sparkline({ points, positive }: { points: string; positive: boolean }) {
  return <svg viewBox="0 0 126 45" className="sparkline" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} fill="none" stroke={positive ? "#39d6a2" : "#ff7185"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MainChart() {
  const points = "0,119 35,112 70,117 105,91 140,99 175,83 210,91 245,67 280,73 315,58 350,68 385,43 420,51 455,29 490,39 525,20 560,27 595,9";
  return <svg viewBox="0 0 595 155" className="main-chart" preserveAspectRatio="none" role="img" aria-label="Illustrative index performance chart">
    <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#42baff" stopOpacity=".25" /><stop offset="100%" stopColor="#42baff" stopOpacity="0" /></linearGradient></defs>
    {[20, 60, 100, 140].map(y => <line key={y} x1="0" x2="595" y1={y} y2={y} stroke="#263545" strokeDasharray="3 5" />)}
    <polygon points={`0,155 ${points} 595,155`} fill="url(#chartFill)" />
    <polyline points={points} fill="none" stroke="#43baff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="595" cy="9" r="4" fill="#43baff" />
  </svg>;
}

export default function Dashboard() {
  const [active, setActive] = useState("Overview");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("1D");
  const [moverMode, setMoverMode] = useState<"Gainers" | "Losers">("Gainers");
  const [sectorFilter, setSectorFilter] = useState("All sectors");
  const [watchlist, setWatchlist] = useState(["RELIANCE", "HDFCBANK", "INFY", "TCS"]);
  const [showAll, setShowAll] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [marketData, setMarketData] = useState<Record<string, { price: string; change: string; positive: boolean; date: string }>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadMarketData() {
      const results = await Promise.all(stocks.map(async (stock) => {
        try {
          const response = await fetch(`/api/market/ohlcv/${stock.symbol}`);
          if (!response.ok) throw new Error(`Unable to load ${stock.symbol}`);
          const payload = await response.json();
          const rows = Array.isArray(payload.data) ? payload.data : [];
          if (rows.length < 2) return null;
          const latest = rows[rows.length - 1];
          const previous = rows[rows.length - 2];
          const close = Number(latest.close);
          const previousClose = Number(previous.close);
          if (!Number.isFinite(close) || !Number.isFinite(previousClose) || previousClose === 0) return null;
          const pct = ((close - previousClose) / previousClose) * 100;
          return [stock.symbol, {
            price: new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(close),
            change: `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
            positive: pct >= 0,
            date: String(latest.date),
          }] as const;
        } catch {
          return null;
        }
      }));
      if (cancelled) return;
      const next: Record<string, { price: string; change: string; positive: boolean; date: string }> = {};
      for (const result of results) if (result) next[result[0]] = result[1];
      setMarketData(next);
      setDataLoading(false);
      if (Object.keys(next).length === 0) setDataError("TejHQ data is temporarily unavailable. Please try again later.");
      else if (Object.keys(next).length < stocks.length) setDataError("Some symbols could not be loaded. Available quotes are shown.");
      else setDataError("");
    }
    loadMarketData();
    return () => { cancelled = true; };
  }, []);

  const liveStocks = useMemo(() => stocks.filter(stock => Boolean(marketData[stock.symbol])).map(stock => ({ ...stock, ...marketData[stock.symbol] })), [marketData]);
  const filtered = useMemo(() => liveStocks.filter(stock =>
    `${stock.symbol} ${stock.company} ${stock.sector}`.toLowerCase().includes(search.toLowerCase()) &&
    (active !== "Watchlist" || watchlist.includes(stock.symbol)) &&
    (sectorFilter === "All sectors" || stock.sector === sectorFilter)
  ), [liveStocks, search, active, watchlist, sectorFilter]);
  const moverStocks = liveStocks.filter(stock => moverMode === "Gainers" ? stock.positive : !stock.positive).slice(0, 4);
  const visible = showAll ? filtered : filtered.slice(0, 5);

  function toggleWatch(symbol: string) {
    setWatchlist(current => current.includes(symbol) ? current.filter(item => item !== symbol) : [...current, symbol]);
  }

  return <main className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-icon"><Activity size={19} /></div><div className="brand-word">market<span>iq</span><small>MARKET INTELLIGENCE</small></div><button className="icon-btn close-nav" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <button className="workspace"><span className="workspace-avatar">A</span><span className="workspace-label"><b>Personal workspace</b><small>India · Equities</small></span><ChevronDown size={15} /></button>
      <nav className="nav-groups">{navigation.map(group => <div className="nav-group" key={group.group}><div className="nav-caption">{group.group}</div>{group.items.map(item => { const Icon = item.icon; return <button key={item.label} onClick={() => { setActive(item.label); setMobileNav(false); }} className={`nav-link ${active === item.label ? "active" : ""}`}><Icon size={17} /><span>{item.label}</span>{item.label === "Watchlist" && <em>{watchlist.length}</em>}</button>; })}</div>)}</nav>
      <div className="sidebar-foot"><div className="demo-state"><i /><span><b>Demo environment</b><small>Sample data · Not live</small></span></div><button className="nav-link"><Settings2 size={17} /><span>Settings</span></button><button className="nav-link"><CircleHelp size={17} /><span>Help & support</span></button><div className="user-card"><div className="user-avatar">AJ</div><span><b>Analyst workspace</b><small>Research account</small></span><ChevronDown size={14} /></div></div>
    </aside>
    {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
    <section className="main-area">
      <header className="topbar"><div className="top-left"><button className="icon-btn open-nav" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="crumb">Workspace <span>/</span> <b>{active}</b></div></div><div className="top-actions"><div className="market-pill"><i /> {dataLoading ? "CONNECTING TEJHQ" : Object.keys(marketData).length ? "TEJHQ · EOD DATA" : "DATA UNAVAILABLE"}</div><button className="icon-btn notification" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-user">AJ</div></div></header>
      <div className="content">
        <div className="page-title"><div><div className="eyebrow">INDIA <span>·</span> MARKET SNAPSHOT</div><h1>{active === "Overview" ? "Market overview" : active}</h1><p>Your daily view of Indian equity markets and the signals moving them.</p></div><button className="snapshot-btn">Market snapshot <ChevronDown size={14} /></button></div>
        <div className="notice"><Sparkles size={16} /><span><b>TejHQ end-of-day data.</b> Stock prices are daily closing prices, usually updated by the next morning. Index cards and index chart remain illustrative.</span><button onClick={() => setActive("Company analysis")}>Explore research <span>→</span></button></div>{dataError && <div className="notice"><span>{dataError}</span></div>}

        <section className="index-grid">{indices.map(index => <article className="index-card" key={index.name}><div className="index-top"><span>{index.name}</span><small><i /> DEMO</small></div><div className="index-value">{index.value}</div><div className={`index-change ${index.positive ? "up" : "down"}`}>{index.positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}{index.change}<span>today</span></div><div className="index-spark"><Sparkline points={index.points} positive={index.positive} /></div><div className="index-foot"><span>{index.sub}</span><span>Illustrative</span></div></article>)}</section>

        <section className="primary-grid">
          <article className="panel chart-panel"><div className="panel-head"><div><div className="panel-kicker">MARKET PERFORMANCE</div><h2>NIFTY 50 <span className="up">+0.82%</span></h2><p>Illustrative index movement</p></div><button className="select-btn">NIFTY 50 <ChevronDown size={13} /></button></div><div className="chart-value"><strong>24,854.05</strong><span>+202.45 (+0.82%)</span></div><div className="chart-wrap"><div className="y-axis"><span>25,000</span><span>24,900</span><span>24,800</span><span>24,700</span></div><div className="chart-plot"><MainChart /><div className="x-axis"><span>09:15</span><span>10:30</span><span>11:45</span><span>13:00</span><span>14:15</span><span>15:30</span></div></div></div><div className="range-tabs">{["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"].map(item => <button key={item} onClick={() => setRange(item)} className={range === item ? "selected" : ""}>{item}</button>)}</div></article>
          <article className="panel movers"><div className="panel-head"><div><div className="panel-kicker">MARKET PULSE</div><h2>Top movers</h2><p>Selected stocks · Latest daily close</p></div><button className="text-btn" onClick={() => setActive("Markets")}>View all →</button></div><div className="mover-tabs"><button className={moverMode === "Gainers" ? "chosen" : ""} onClick={() => setMoverMode("Gainers")}>Gainers</button><button className={moverMode === "Losers" ? "chosen" : ""} onClick={() => setMoverMode("Losers")}>Losers</button></div>{moverStocks.map(stock => <div className="mover-row" key={stock.symbol}><div className="stock-logo">{stock.symbol.slice(0, 1)}</div><div className="mover-name"><b>{stock.symbol}</b><small>{stock.sector}</small></div><div className="mover-quote"><b>₹{stock.price}</b><small className={stock.positive ? "up" : "down"}>{stock.change}</small></div></div>)}</article>
        </section>

        <section className="lower-grid">
          <article className="panel watch-panel"><div className="panel-head"><div><div className="panel-kicker">YOUR TRACKING</div><h2>Market watchlist</h2><p>Latest available NSE daily closing prices.</p></div><button className="add-btn" onClick={() => setShowAll(value => !value)}>{showAll ? "Show fewer" : "Browse all stocks"}</button></div><div className="table-tools"><div className="search-box"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search stocks..." /></div><select className="filter-btn" aria-label="Filter by sector" value={sectorFilter} onChange={event => setSectorFilter(event.target.value)}><option>All sectors</option>{Array.from(new Set(stocks.map(stock => stock.sector))).map(sector => <option key={sector}>{sector}</option>)}</select></div><div className="table-scroll"><table><thead><tr><th>COMPANY</th><th>SECTOR</th><th className="align-right">LAST PRICE</th><th className="align-right">CHANGE</th><th /></tr></thead><tbody>{visible.map(stock => <tr key={stock.symbol}><td><div className="company-cell"><div className="stock-logo">{stock.symbol.slice(0, 1)}</div><span><b>{stock.symbol}</b><small>{stock.company}</small></span></div></td><td><span className="sector-tag">{stock.sector}</span></td><td className="align-right mono">₹{stock.price}</td><td className={`align-right mono ${stock.positive ? "up" : "down"}`}>{stock.change}</td><td className="align-right"><button className={`star-btn ${watchlist.includes(stock.symbol) ? "starred" : ""}`} onClick={() => toggleWatch(stock.symbol)} aria-label={watchlist.includes(stock.symbol) ? "Remove from watchlist" : "Add to watchlist"}><Star size={15} fill={watchlist.includes(stock.symbol) ? "currentColor" : "none"} /></button></td></tr>)}</tbody></table>{visible.length === 0 && <div className="empty">No stocks match your search.</div>}</div><div className="table-foot"><span>{active === "Watchlist" ? "Your watchlist" : "Showing"} {visible.length} of {filtered.length} companies · {dataLoading ? "Loading prices…" : "TejHQ daily close"}</span><button onClick={() => setShowAll(value => !value)}>{showAll ? "Show less" : "View all stocks"} →</button></div></article>
          <article className="panel sectors"><div className="panel-head"><div><div className="panel-kicker">SECTOR MONITOR</div><h2>Sector performance</h2><p>Illustrative sector returns · not yet connected</p></div></div>{[["Banking",82,"+1.42%",true],["Automobile",68,"+1.08%",true],["Energy",57,"+0.76%",true],["FMCG",42,"+0.31%",true],["Information Technology",29,"-0.64%",false],["Pharma",18,"-0.92%",false]].map(([name,width,change,positive]) => <div className="sector-row" key={String(name)}><div><span>{name}</span><b className={positive ? "up" : "down"}>{change}</b></div><div className="sector-track"><i className={positive ? "gain" : "loss"} style={{width:`${width}%`}} /></div></div>)}</article>
        </section>

        <section className="research-grid"><article className="panel research-card"><div className="research-icon"><Sparkles size={18} /></div><div><div className="panel-kicker">COMING NEXT</div><h3>AI research analyst</h3><p>Company deep-dives, financial statement interpretation and valuation insights in one workflow.</p></div><button onClick={() => setActive("Company analysis")}>Explore →</button></article><article className="panel research-card"><div className="research-icon violet"><FileText size={18} /></div><div><div className="panel-kicker">RESEARCH DESK</div><h3>Company intelligence</h3><p>Track quarterly results, key ratios, cash flows and long-term financial performance.</p></div><button onClick={() => setActive("Company analysis")}>Explore →</button></article></section>
        <footer className="footer"><span>MARKETIQ <b>·</b> BUILT FOR BETTER RESEARCH</span><span>Private workspace · TejHQ end-of-day stock data</span><span>India <Globe2 size={12} /></span></footer>
      </div>
    </section>
  </main>;
}
