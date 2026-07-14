import { useEffect, useMemo, useState } from "react";
import { STOCKS, INDICES, FNO, MUTUAL_FUNDS, ALTERNATIVES, NEWS, priceFor, seriesFor } from "@/lib/marketData";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, Legend } from "recharts";
import { Plus, Trash2, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { fmtINR } from "@/lib/taxConfig";
import AiPanel from "@/components/AiPanel";
import { getPortfolio, savePortfolio } from "@/lib/api";
import { toast } from "sonner";

const fmtUSD = (n) => "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function Investments() {
  const [tab, setTab] = useState("stocks");
  const [selected, setSelected] = useState("RELIANCE");
  const [holdings, setHoldings] = useState([]);
  const [watch, setWatch] = useState([]);
  const [newSym, setNewSym] = useState("");
  const [newQty, setNewQty] = useState(10);
  const [newAvg, setNewAvg] = useState(2500);

  useEffect(() => {
    getPortfolio().then((r) => { setHoldings(r.holdings || []); setWatch(r.watchlist || []); }).catch(() => {});
  }, []);

  const stockMap = useMemo(() => Object.fromEntries(STOCKS.map((s) => [s.s, s])), []);
  const current = stockMap[selected] || STOCKS[0];
  const currentPrice = priceFor(current.s, current.base);
  const series = seriesFor(current.s, current.base);

  const summary = useMemo(() => {
    let inv = 0, val = 0;
    holdings.forEach((h) => {
      const meta = stockMap[h.sym];
      if (!meta) return;
      const p = priceFor(meta.s, meta.base);
      inv += Number(h.qty) * Number(h.avg);
      val += Number(h.qty) * p;
    });
    return { inv, val, pnl: val - inv, pct: inv ? ((val - inv) / inv) * 100 : 0 };
  }, [holdings, stockMap]);

  const addHolding = () => {
    if (!newSym || !stockMap[newSym]) return toast.error("Pick a valid symbol");
    setHoldings((h) => [...h, { sym: newSym, qty: Number(newQty), avg: Number(newAvg) }]);
    setNewSym(""); setNewQty(10); setNewAvg(2500);
  };
  const removeHolding = (i) => setHoldings((h) => h.filter((_, x) => x !== i));
  const toggleWatch = (s) => setWatch((w) => w.includes(s) ? w.filter((x) => x !== s) : [...w, s]);
  const persist = async () => { await savePortfolio(holdings, watch); toast.success("Portfolio saved"); };

  // SIP
  const [sipAmt, setSipAmt] = useState(15000);
  const [sipYrs, setSipYrs] = useState(15);
  const [sipRate, setSipRate] = useState(12);
  const sipData = useMemo(() => {
    const rows = [];
    const r = sipRate / 100 / 12;
    let val = 0;
    for (let y = 1; y <= sipYrs; y++) {
      const n = y * 12;
      const fv = sipAmt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      const inv = sipAmt * n;
      rows.push({ year: `Y${y}`, invested: Math.round(inv), gain: Math.round(fv - inv) });
      val = fv;
    }
    return { rows, final: Math.round(val) };
  }, [sipAmt, sipYrs, sipRate]);

  // Goal Planner
  const [target, setTarget] = useState(5000000);
  const [horizon, setHorizon] = useState(10);
  const [risk, setRisk] = useState("Moderate");
  const requiredSIP = useMemo(() => {
    const r = 0.12 / 12;
    const n = horizon * 12;
    return Math.round((target * r) / (Math.pow(1 + r, n) - 1) / (1 + r));
  }, [target, horizon]);
  const allocation = risk === "Aggressive" ? { Stocks: 70, MF: 20, Alt: 10 } : risk === "Conservative" ? { Stocks: 30, MF: 30, Alt: 40 } : { Stocks: 50, MF: 30, Alt: 20 };

  // Comparison
  const [cmpA, setCmpA] = useState("RELIANCE"), [cmpB, setCmpB] = useState("TCS"), [cmpC, setCmpC] = useState("INFY");

  return (
    <div className="space-y-6" data-testid="investments-page">
      <div>
        <div className="text-xs font-mono-data text-cyan-300 uppercase tracking-widest">Section 3</div>
        <h1 className="font-display text-4xl text-white mt-1 tracking-tight">Investment & AI Wealth Portal</h1>
        <p className="text-zinc-500 mt-2 text-sm">40 stocks · 14 F&O contracts · 18 mutual funds · 24 alternatives — plus AI advisor, SIP planner and news sentiment feed.</p>
      </div>

      {/* Indices ticker */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden" data-testid="indices-ticker">
        <div className="flex overflow-hidden">
          <div className="mfb-ticker flex gap-6 py-3 px-4 whitespace-nowrap">
            {[...INDICES, ...INDICES].map((i, k) => {
              const p = priceFor(i.s, i.base);
              const chg = ((p - i.base) / i.base) * 100;
              return (
                <span key={k} className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-400 font-display">{i.s}</span>
                  <span className="font-mono-data text-white">{i.base > 1000 ? p.toFixed(0) : p.toFixed(2)}</span>
                  <span className={`font-mono-data text-xs ${chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)}%</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="stocks" data-testid="tab-stocks">Stocks</TabsTrigger>
          <TabsTrigger value="fno" data-testid="tab-fno">F&O</TabsTrigger>
          <TabsTrigger value="mf" data-testid="tab-mf">Mutual Funds</TabsTrigger>
          <TabsTrigger value="alt" data-testid="tab-alt">Alternatives</TabsTrigger>
          <TabsTrigger value="portfolio" data-testid="tab-portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="advisor" data-testid="tab-advisor">AI Advisor</TabsTrigger>
          <TabsTrigger value="tools" data-testid="tab-tools">Quant Tools</TabsTrigger>
          <TabsTrigger value="news" data-testid="tab-news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-500 font-mono-data">{current.market} · {current.sector}</div>
                  <div className="font-display text-2xl text-white">{current.n}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono-data text-3xl text-white">{current.currency === "INR" ? fmtINR(currentPrice) : fmtUSD(currentPrice)}</div>
                  <div className={`text-xs font-mono-data ${currentPrice >= current.base ? "text-emerald-400" : "text-red-400"}`}>{currentPrice >= current.base ? "+" : ""}{(((currentPrice - current.base) / current.base) * 100).toFixed(2)}% · 30d</div>
                </div>
              </div>
              <div className="h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} /><stop offset="100%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a" }} />
                    <Area dataKey="price" stroke="#06b6d4" fill="url(#g1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 max-h-[440px] overflow-auto">
              <div className="text-xs text-zinc-500 mb-2 font-mono-data uppercase">Universe (40)</div>
              <div className="space-y-1">
                {STOCKS.map((s) => {
                  const p = priceFor(s.s, s.base);
                  const chg = ((p - s.base) / s.base) * 100;
                  return (
                    <div key={s.s} data-testid={`stock-${s.s}`} onClick={() => setSelected(s.s)} role="button" tabIndex={0} className={`cursor-pointer w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${selected === s.s ? "bg-cyan-500/10 text-cyan-300" : "hover:bg-zinc-800/60 text-zinc-300"}`}>
                      <span className="font-display">{s.s}</span>
                      <span className="flex items-center gap-3">
                        <span className="font-mono-data text-xs">{s.currency === "INR" ? "₹" : "$"}{p.toFixed(2)}</span>
                        <span className={`text-[10px] font-mono-data ${chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>{chg >= 0 ? "+" : ""}{chg.toFixed(1)}%</span>
                        <span data-testid={`watch-${s.s}`} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); toggleWatch(s.s); }} className={`text-xs cursor-pointer ${watch.includes(s.s) ? "text-cyan-300" : "text-zinc-500 hover:text-white"}`}>★</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fno" className="mt-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950 text-zinc-500 text-[11px] uppercase font-mono-data tracking-wider">
                <tr><th className="text-left px-4 py-3">Underlying</th><th>Type</th><th>Strike</th><th>LTP</th><th>IV %</th><th>OI</th></tr>
              </thead>
              <tbody>
                {FNO.map((f) => (
                  <tr key={f.id} className="border-t border-zinc-800 hover:bg-zinc-800/40 text-zinc-300">
                    <td className="px-4 py-2.5 font-display">{f.underlying}</td>
                    <td className="text-center"><Badge className={f.type === "CE" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25" : "bg-red-500/15 text-red-300 border border-red-500/25"}>{f.type}</Badge></td>
                    <td className="text-center font-mono-data">{f.strike}</td>
                    <td className="text-center font-mono-data">{f.ltp}</td>
                    <td className="text-center font-mono-data">{f.iv}</td>
                    <td className="text-center font-mono-data">{f.oi.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="mf" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MUTUAL_FUNDS.map((f) => (
              <div key={f.s} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-cyan-500/40 transition-colors">
                <Badge className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 text-[10px]">{f.cat}</Badge>
                <div className="font-display text-white mt-2 text-sm">{f.n}</div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div><div className="text-zinc-500 font-mono-data">NAV</div><div className="text-white font-mono-data">{f.nav}</div></div>
                  <div><div className="text-zinc-500 font-mono-data">3Y</div><div className="text-emerald-400 font-mono-data">{f.r3y}%</div></div>
                  <div><div className="text-zinc-500 font-mono-data">5Y</div><div className="text-emerald-400 font-mono-data">{f.r5y}%</div></div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alt" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALTERNATIVES.map((a) => (
              <div key={a.s} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <Badge className="bg-blue-500/10 text-blue-300 border border-blue-500/25 text-[10px]">{a.cat}</Badge>
                <div className="font-display text-white mt-2 text-sm">{a.n}</div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div><div className="text-zinc-500 font-mono-data">Rate</div><div className="text-emerald-400 font-mono-data text-[11px]">{a.rate}</div></div>
                  <div><div className="text-zinc-500 font-mono-data">Tax</div><div className="text-zinc-300 font-mono-data text-[11px]">{a.tax}</div></div>
                  <div><div className="text-zinc-500 font-mono-data">Lock</div><div className="text-zinc-300 font-mono-data text-[11px]">{a.lock}</div></div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Invested" value={fmtINR(summary.inv)} />
            <Kpi label="Current Value" value={fmtINR(summary.val)} tone="cyan" />
            <Kpi label="P&L" value={(summary.pnl >= 0 ? "+" : "") + fmtINR(summary.pnl)} tone={summary.pnl >= 0 ? "green" : "red"} />
            <Kpi label="Return %" value={`${summary.pct.toFixed(2)}%`} tone={summary.pct >= 0 ? "green" : "red"} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 text-zinc-500 text-[11px] uppercase font-mono-data">
                  <tr><th className="text-left px-4 py-3">Symbol</th><th>Qty</th><th>Avg</th><th>LTP</th><th>P&L</th><th></th></tr>
                </thead>
                <tbody>
                  {holdings.length === 0 && <tr><td colSpan={6} className="text-center text-zinc-500 py-8 text-xs">No holdings yet. Add one below.</td></tr>}
                  {holdings.map((h, i) => {
                    const meta = stockMap[h.sym]; if (!meta) return null;
                    const p = priceFor(meta.s, meta.base);
                    const pnl = (p - h.avg) * h.qty;
                    return (
                      <tr key={i} className="border-t border-zinc-800 text-zinc-300">
                        <td className="px-4 py-2 font-display">{h.sym}</td>
                        <td className="text-center font-mono-data">{h.qty}</td>
                        <td className="text-center font-mono-data">{h.avg}</td>
                        <td className="text-center font-mono-data">{p.toFixed(2)}</td>
                        <td className={`text-center font-mono-data ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{pnl >= 0 ? "+" : ""}{fmtINR(pnl)}</td>
                        <td><Button size="sm" variant="ghost" onClick={() => removeHolding(i)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-4 border-t border-zinc-800 flex flex-wrap gap-2 items-end">
                <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Symbol</Label>
                  <select value={newSym} onChange={(e) => setNewSym(e.target.value)} data-testid="hold-sym" className="mt-1 bg-zinc-950 border border-zinc-800 rounded-md px-2 py-2 text-white text-sm">
                    <option value="">select</option>{STOCKS.map((s) => <option key={s.s}>{s.s}</option>)}
                  </select></div>
                <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Qty</Label><Input data-testid="hold-qty" type="number" value={newQty} onChange={(e) => setNewQty(e.target.value)} className="mt-1 w-20 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
                <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Avg</Label><Input data-testid="hold-avg" type="number" value={newAvg} onChange={(e) => setNewAvg(e.target.value)} className="mt-1 w-28 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
                <Button data-testid="hold-add" onClick={addHolding} className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                <Button variant="outline" data-testid="hold-save" onClick={persist} className="border-zinc-700 text-zinc-300 ml-auto">Save</Button>
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="text-xs text-zinc-500 mb-2 font-mono-data uppercase">Watchlist ({watch.length})</div>
              <div className="space-y-1 max-h-72 overflow-auto">
                {watch.map((s) => {
                  const meta = stockMap[s]; if (!meta) return null;
                  const p = priceFor(meta.s, meta.base);
                  return (
                    <div key={s} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-950/60 text-sm">
                      <span className="font-display text-white">{s}</span>
                      <span className="font-mono-data text-zinc-300">{meta.currency === "INR" ? "₹" : "$"}{p.toFixed(2)}</span>
                      <button onClick={() => toggleWatch(s)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  );
                })}
                {watch.length === 0 && <div className="text-xs text-zinc-500 text-center py-6">Star any stock from the Stocks tab.</div>}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advisor" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="font-display text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-300" /> Goal Planner</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Target ₹</Label><Input data-testid="goal-target" type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
                <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Horizon (yrs)</Label><Input data-testid="goal-horizon" type="number" value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
                <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Risk</Label>
                  <select data-testid="goal-risk" value={risk} onChange={(e) => setRisk(e.target.value)} className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-md px-2 py-2 text-white text-sm">
                    <option>Conservative</option><option>Moderate</option><option>Aggressive</option>
                  </select></div>
              </div>
              <div className="rounded-lg bg-cyan-500/[0.05] border border-cyan-500/25 p-4">
                <div className="text-xs text-zinc-400">Required monthly SIP (assuming 12% CAGR):</div>
                <div className="font-mono-data text-3xl text-cyan-300 mt-1">{fmtINR(requiredSIP)}</div>
                <div className="mt-3 text-xs text-zinc-400">Asset allocation for a {risk} investor: <span className="text-white font-mono-data">Stocks {allocation.Stocks}% · MF {allocation.MF}% · Alternatives {allocation.Alt}%</span></div>
              </div>
            </div>
            <AiPanel
              label="AI Wealth Advisor"
              buildPrompt={() => `Design a portfolio plan for target ₹${target}, ${horizon} years, ${risk} risk. Preferred markets: Indian + US. Suggest asset allocation weights, top 3 specific stock/fund picks from my universe (${STOCKS.map((s) => s.s).slice(0, 20).join(", ")}) or MFs (${MUTUAL_FUNDS.map((f) => f.n).slice(0, 6).join(", ")}). For each pick include Why / How to execute / Risks. End with a one-line SEBI disclaimer.`}
            />
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
              <div className="font-display text-white">SIP Calculator</div>
              <div className="mt-4 space-y-4">
                <SliderRow label={`Monthly Investment: ${fmtINR(sipAmt)}`} value={sipAmt} onChange={setSipAmt} min={1000} max={200000} step={500} tid="sip-amt" />
                <SliderRow label={`Duration: ${sipYrs} yrs`} value={sipYrs} onChange={setSipYrs} min={1} max={40} step={1} tid="sip-yrs" />
                <SliderRow label={`Return: ${sipRate}%`} value={sipRate} onChange={setSipRate} min={4} max={22} step={0.5} tid="sip-rate" />
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sipData.rows}>
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis dataKey="year" stroke="#71717a" fontSize={10} /><YAxis stroke="#71717a" fontSize={10} />
                    <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a" }} /><Legend />
                    <Bar dataKey="invested" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="gain" stackId="a" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-sm text-zinc-400">Final corpus: <span className="text-white font-mono-data text-lg">{fmtINR(sipData.final)}</span></div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
              <div className="font-display text-white">Stock Comparison</div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[[cmpA, setCmpA], [cmpB, setCmpB], [cmpC, setCmpC]].map(([v, set], i) => (
                  <select key={i} data-testid={`cmp-${i}`} value={v} onChange={(e) => set(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-2 text-white text-xs">
                    {STOCKS.map((s) => <option key={s.s}>{s.s}</option>)}
                  </select>
                ))}
              </div>
              <table className="w-full text-sm mt-4">
                <thead className="text-zinc-500 text-[11px] uppercase font-mono-data"><tr><th className="text-left">Metric</th><th>{cmpA}</th><th>{cmpB}</th><th>{cmpC}</th></tr></thead>
                <tbody className="text-zinc-300">
                  {["Price", "P/E", "Mkt Cap", "AI View"].map((metric, mi) => (
                    <tr key={metric} className="border-t border-zinc-800">
                      <td className="py-2 text-zinc-500">{metric}</td>
                      {[cmpA, cmpB, cmpC].map((sym) => {
                        const meta = stockMap[sym]; const p = priceFor(sym, meta.base);
                        const vals = [`${meta.currency === "INR" ? "₹" : "$"}${p.toFixed(2)}`, `${(15 + (sym.length % 10)).toFixed(1)}`, `${(meta.base * 1000).toLocaleString()} Cr`, mi % 2 === 0 ? "Buy" : "Hold"];
                        return <td key={sym} className="text-center font-mono-data">{vals[mi]}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="news" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {NEWS.map((n, i) => (
              <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs">
                  <Badge className="bg-zinc-800 text-cyan-300 border border-zinc-700 font-mono-data">{n.s}</Badge>
                  <span className="text-zinc-500 font-mono-data">{n.age} ago</span>
                </div>
                <div className="text-sm text-zinc-200 mt-2">{n.t}</div>
                <div className="mt-3 flex items-center gap-2">
                  {n.sentiment === "positive" && <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"><TrendingUp className="w-3 h-3 mr-1" /> Positive</Badge>}
                  {n.sentiment === "negative" && <Badge className="bg-red-500/15 text-red-300 border border-red-500/25"><TrendingDown className="w-3 h-3 mr-1" /> Negative</Badge>}
                  {n.sentiment === "neutral" && <Badge className="bg-zinc-700 text-zinc-300">Neutral</Badge>}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ label, value, tone = "default" }) {
  const c = tone === "green" ? "text-emerald-400" : tone === "red" ? "text-red-400" : tone === "cyan" ? "text-cyan-300" : "text-white";
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono-data">{label}</div>
      <div className={`font-mono-data text-2xl mt-2 ${c}`}>{value}</div>
    </div>
  );
}

function SliderRow({ label, value, onChange, min, max, step, tid }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-zinc-400"><span>{label}</span></div>
      <Slider data-testid={tid} value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} className="mt-2" />
    </div>
  );
}
