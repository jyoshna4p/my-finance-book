import { NavLink } from "react-router-dom";
import { Receipt, FileSpreadsheet, TrendingUp, Factory, Percent, ShieldAlert, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { fmtINR } from "@/lib/taxConfig";

const CARDS = [
  { to: "/app/income-tax", icon: Receipt, title: "Income Tax", desc: "4-step wizard · Old vs New regime · FY 2023-24 → 2026-27 · refund maximizer.", tid: "card-income-tax" },
  { to: "/app/gst", icon: FileSpreadsheet, title: "GST Returns", desc: "Supply profile · ITC optimizer · Blocked Credit detector · GSTR-1 → 3B guide.", tid: "card-gst" },
  { to: "/app/investments", icon: TrendingUp, title: "Investments & AI Wealth", desc: "40 stocks · 14 F&O · 18 MFs · 24 alternatives · AI advisor + SIP planner.", tid: "card-investments" },
  { to: "/app/cost-audit", icon: Factory, title: "Cost Audit CRA-3", desc: "Sec 148 eligibility · CAS-2 capacity · 3-way GST recon · MCA XBRL generator.", tid: "card-cost-audit" },
  { to: "/app/tds", icon: Percent, title: "TDS / TCS Ledger", desc: "TY 2026-27 codes 1001-1092 · PAN checker · Form 140/131 quarterly output.", tid: "card-tds" },
  { to: "/app/gst-audit", icon: ShieldAlert, title: "GST Audit Recon", desc: "5-phase audit — mapping, multi-way recon, ITC risk, timeline, DRC-03 directives.", tid: "card-gst-audit" },
];

export default function Overview() {
  return (
    <div className="space-y-8" data-testid="overview-page">
      <div>
        <div className="text-xs font-mono-data text-cyan-300 uppercase tracking-widest">Command Center</div>
        <h1 className="font-display text-4xl lg:text-5xl text-white mt-2 tracking-tight">Your compliance in one glance.</h1>
        <p className="text-zinc-500 mt-3 max-w-2xl leading-relaxed">Six statutory modules, one continuous ledger. Everything below refreshes instantly with FY 2026-27 rules under the Income Tax Act, 2025 and Budget 2026.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi label="Expected refund (FY 2025-26)" value={fmtINR(48200)} tone="emerald" />
        <Kpi label="GST cash payable (Nov 2025)" value={fmtINR(126400)} tone="cyan" />
        <Kpi label="Portfolio P&L (unrealised)" value={"+ " + fmtINR(214560)} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((c) => (
          <NavLink
            key={c.to}
            to={c.to}
            data-testid={c.tid}
            className="group bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <c.icon className="w-5 h-5 text-cyan-300" strokeWidth={1.6} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-cyan-300 transition-colors" />
            </div>
            <div className="font-display text-lg text-white mt-5">{c.title}</div>
            <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{c.desc}</p>
          </NavLink>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div className="font-display text-white mt-3">Why My Finance Book</div>
          <ul className="mt-3 text-sm text-zinc-400 space-y-2 leading-relaxed">
            <li>· Instant multi-ledger cross-reconciliation across Books ↔ GSTR ↔ CRA-3.</li>
            <li>· Automated statutory limit tracking under the 2026 & 2027 mandate.</li>
            <li>· Predictive AI anomaly detection (Claude Sonnet 4.5 + GPT-5.2).</li>
          </ul>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-6">
          <Zap className="w-5 h-5 text-red-400" />
          <div className="font-display text-white mt-3">The competition</div>
          <ul className="mt-3 text-sm text-zinc-400 space-y-2 leading-relaxed">
            <li>· Slow manual filings, no cross-form validation.</li>
            <li>· Isolated tools — GST here, IT there, Cost Audit somewhere else.</li>
            <li>· Delayed spreadsheet accounting, human errors, notices.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }) {
  const tones = {
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.03]",
    cyan: "text-cyan-300 border-cyan-500/20 bg-cyan-500/[0.03]",
    red: "text-red-400 border-red-500/20 bg-red-500/[0.03]",
  };
  return (
    <div className={`rounded-xl border ${tones[tone]} p-5`}>
      <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono-data">{label}</div>
      <div className={`font-mono-data text-3xl mt-2 ${tones[tone].split(" ")[0]}`}>{value}</div>
    </div>
  );
}
