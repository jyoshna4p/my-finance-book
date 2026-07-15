import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { fmtINR } from "@/lib/taxConfig";
import { Landmark, Home, Coins, TrendingUp, Wallet, Sparkles } from "lucide-react";

const PROFILES = [
  { k: "conservative", n: "Conservative", weights: { land: 15, gold: 20, flat: 30, mf: 20, stocks: 5, fd: 10 }, note: "Capital preservation with mild growth. Higher physical + fixed income tilt." },
  { k: "moderate",     n: "Moderate",     weights: { land: 20, gold: 15, flat: 25, mf: 20, stocks: 15, fd: 5 }, note: "Balanced — the classic \"60% physical / 40% financial\" split for Indian families." },
  { k: "aggressive",   n: "Aggressive",   weights: { land: 25, gold: 10, flat: 15, mf: 25, stocks: 20, fd: 5 }, note: "Growth-oriented. Higher land + equity exposure." },
];

const BUCKET_META = {
  land: { icon: Landmark, title: "Plot / Land", why: "Highest long-term appreciation. Buy where infrastructure is going, not where it already is (upcoming metro corridors, ORR, IT clusters).", risk: "Illiquid, encroachment risk. Insist on updated Encumbrance Certificate + Patta/Khata." },
  gold: { icon: Coins, title: "Gold (SGB / Digital Gold)", why: "Inflation hedge + INR-hedge. SGB gives 2.5% interest and zero LTCG on maturity — beats physical jewellery.", risk: "8-year lock-in for SGB. Digital gold has custodian risk." },
  flat: { icon: Home, title: "Flat / Apartment", why: "Immediate rental income (~2.5-3.5% yield) + capital gains. Society-managed (lower maintenance headache).", risk: "Lower appreciation vs land. Verify RERA registration + OC + CC before payout." },
  mf: { icon: TrendingUp, title: "Mutual Funds (STP-based)", why: "Deploy 60% at once, remaining 40% via Systematic Transfer Plan over 6–12 months to average out entry. Prefer Nifty 500 index + one flexi-cap.", risk: "Market volatility — 3+ year horizon required." },
  stocks: { icon: TrendingUp, title: "Direct Equity", why: "Own the top 8-10 large-caps directly for lifetime compounding + zero expense ratio.", risk: "Requires research or advisor. Diversify across sectors." },
  fd: { icon: Wallet, title: "Emergency Cushion (FD / Liquid)", why: "6 months of expenses in a sweep-in FD before deploying to growth assets.", risk: "Post-tax return may lag inflation — keep just enough." },
};

const PLATFORMS = ["Zerodha Coin (direct MFs, zero commission)", "Groww / Kuvera / MF Central (SIP + STP)", "Zerodha / Angel One / ICICI Direct (equity)", "RBI Retail Direct (SGB & G-Secs)", "NSE goBID (T-Bills)", "State RERA portal + a licensed lawyer for property closure"];

const RED_FLAGS = [
  "Any project not listed on the state RERA portal.",
  "Builder refusing to share Occupancy Certificate (OC) or Commencement Certificate (CC).",
  "Land where the Encumbrance Certificate (EC) shows active mortgages or disputes.",
  "Cash-only or \"NRI-only\" pricing without proper title chain (Mother Deed → Sale Deed → Patta).",
  "Verbal promises about \"upcoming metro / expressway\" without a notified alignment gazette.",
];

export default function LumpsumAdvisor() {
  const [amount, setAmount] = useState(5000000);
  const [profile, setProfile] = useState("moderate");
  const [horizon, setHorizon] = useState(10);

  const cfg = PROFILES.find((p) => p.k === profile);
  const allocation = useMemo(() => {
    return Object.entries(cfg.weights).map(([k, pct]) => ({ k, pct, amount: Math.round((amount * pct) / 100) }));
  }, [amount, cfg]);

  return (
    <div className="space-y-4" data-testid="lumpsum-advisor">
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <div className="font-display text-white">Lumpsum Allocation Advisor</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-[10px] uppercase font-mono-data text-zinc-500">Lumpsum in hand (₹)</Label>
            <Input data-testid="lump-amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" />
          </div>
          <div>
            <Label className="text-[10px] uppercase font-mono-data text-zinc-500">Horizon (years)</Label>
            <Input data-testid="lump-horizon" type="number" value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" />
          </div>
          <div>
            <Label className="text-[10px] uppercase font-mono-data text-zinc-500">Risk Profile</Label>
            <div className="mt-1 flex gap-1">
              {PROFILES.map((p) => (
                <button
                  key={p.k}
                  data-testid={`lump-${p.k}`}
                  onClick={() => setProfile(p.k)}
                  className={`flex-1 px-2 py-2 rounded-md text-xs font-display border ${profile === p.k ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" : "border-zinc-800 text-zinc-400 hover:text-white"}`}
                >
                  {p.n}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-zinc-400 italic">{cfg.note}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allocation.map(({ k, pct, amount: amt }) => {
          const meta = BUCKET_META[k];
          const Icon = meta.icon;
          return (
            <div key={k} data-testid={`bucket-${k}`} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <div className="font-display text-white text-sm">{meta.title}</div>
                    <div className="text-[10px] text-zinc-500 font-mono-data">{pct}% allocation</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono-data text-xl text-cyan-300">{fmtINR(amt)}</div>
                </div>
              </div>
              <div className="text-[11px] text-zinc-400 mt-3 leading-relaxed">{meta.why}</div>
              <div className="text-[11px] text-red-300 mt-2 leading-relaxed"><span className="text-zinc-500">Risk: </span>{meta.risk}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5">
          <div className="font-display text-white text-sm mb-2">Where to actually buy (India)</div>
          <ul className="text-xs text-zinc-300 space-y-1.5 leading-relaxed">
            {PLATFORMS.map((p) => <li key={p}>· {p}</li>)}
          </ul>
        </div>
        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.04] p-5">
          <div className="font-display text-white text-sm mb-2">3 Property Red Flags (walk-away signs)</div>
          <ul className="text-xs text-zinc-300 space-y-1.5 leading-relaxed">
            {RED_FLAGS.slice(0, 3).map((r) => <li key={r}>· {r}</li>)}
          </ul>
          <div className="text-[10px] text-zinc-500 mt-3 font-mono-data">Documents to demand: Title Deed · Mother Deed · Encumbrance Certificate · Patta/Khata · RERA reg # · OC + CC.</div>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/[0.04] p-4 text-xs text-zinc-300 leading-relaxed">
        <span className="text-cyan-300 font-display">Land vs Flat — quick verdict for {fmtINR(amount)}: </span>
        {amount >= 4000000
          ? "Split ~60% into a Tier-2 plot in an upcoming corridor (higher appreciation, low upkeep) and ~40% into liquid financial assets (MF STP + equity). Skip the flat unless you need immediate rent."
          : "This budget is too tight for a plot in a good micro-market. Prefer a rental-yielding 2BHK flat in a RERA-registered project + 40% into MFs / SGBs — you'll earn 2.5-3.5% rent while equity compounds."}
      </div>
    </div>
  );
}
