import { useMemo, useState } from "react";
import AiPanel from "@/components/AiPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtINR } from "@/lib/taxConfig";
import { UploadCloud, AlertTriangle, ShieldCheck, Clock } from "lucide-react";

export default function GSTAudit() {
  const [fy, setFy] = useState("2024-25");
  const [gstin, setGstin] = useState("27AABCM1234A1Z5");
  const [f, setF] = useState({
    plRevenue: 42500000,
    gstr1Tax: 7590000,
    gstr3bTax: 7420000,
    itc3b: 3120000,
    itc2b: 2990000,
    itcPr: 3150000,
    blockedFound: 145000,
    exemptRev: 850000,
    unpaid180: 220000,
    lateDays: 8,
  });

  const set = (k, v) => setF((x) => ({ ...x, [k]: Number(v) }));

  const c = useMemo(() => {
    const salesGap = f.plRevenue * 0.18 - f.gstr1Tax; // vs "expected 18%" pseudo
    const taxGap = f.gstr1Tax - f.gstr3bTax;
    const itcGap3b_2b = f.itc3b - f.itc2b;
    const itcGap3b_pr = f.itc3b - f.itcPr;
    const rule42 = f.exemptRev > 0 ? Math.round((f.exemptRev / f.plRevenue) * f.itc3b) : 0;
    const interest180 = Math.round(f.unpaid180 * 0.18);
    const interestLate = Math.round(f.gstr3bTax * 0.18 * (f.lateDays / 365));
    const netLiability = Math.max(0, taxGap) + Math.max(0, itcGap3b_2b) + Math.max(0, f.blockedFound) + interest180 + interestLate;
    return { salesGap, taxGap, itcGap3b_2b, itcGap3b_pr, rule42, interest180, interestLate, netLiability };
  }, [f]);

  return (
    <div className="space-y-6" data-testid="gst-audit-page">
      <div>
        <div className="text-xs font-mono-data text-cyan-300 uppercase tracking-widest">Section 6</div>
        <h1 className="font-display text-4xl text-white mt-1 tracking-tight">GST Audit · Multi-Way Reconciliation</h1>
        <p className="text-zinc-500 mt-2 text-sm">5-phase audit — mapping, multi-way recon, ITC risk, timeline & interest, finalisation with DRC-03 directives.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {["Sales Register / GSTR-1", "Purchase Register / ITC Ledger", "GSTR-3B Summary", "GSTR-2B (Auto) & P&L"].map((d) => (
          <div key={d} className="border border-dashed border-zinc-700 rounded-xl p-5 text-center text-xs text-zinc-500 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors cursor-pointer">
            <UploadCloud className="w-6 h-6 mx-auto mb-2" />
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">FY</Label>
              <select data-testid="fy" value={fy} onChange={(e) => setFy(e.target.value)} className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-md px-2 py-2 text-white text-sm">
                <option>2023-24</option><option>2024-25</option><option>2025-26</option>
              </select></div>
            <div className="col-span-1 md:col-span-3"><Label className="text-[10px] uppercase font-mono-data text-zinc-500">GSTIN</Label><Input data-testid="gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
          </div>
          <div className="font-display text-white pt-2">Phase 1 · Control Totals</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Fld label="Turnover (P&L)" v={f.plRevenue} on={(v) => set("plRevenue", v)} tid="a-pl" />
            <Fld label="GST — GSTR-1" v={f.gstr1Tax} on={(v) => set("gstr1Tax", v)} tid="a-g1" />
            <Fld label="GST Paid — GSTR-3B" v={f.gstr3bTax} on={(v) => set("gstr3bTax", v)} tid="a-g3" />
            <Fld label="ITC claimed 3B" v={f.itc3b} on={(v) => set("itc3b", v)} tid="a-itc3b" />
            <Fld label="ITC in GSTR-2B" v={f.itc2b} on={(v) => set("itc2b", v)} tid="a-itc2b" />
            <Fld label="ITC in Purchase Register" v={f.itcPr} on={(v) => set("itcPr", v)} tid="a-itcpr" />
            <Fld label="Blocked ITC (17(5)) found" v={f.blockedFound} on={(v) => set("blockedFound", v)} tid="a-blk" />
            <Fld label="Exempt Income (P&L)" v={f.exemptRev} on={(v) => set("exemptRev", v)} tid="a-exempt" />
            <Fld label="Vendor Unpaid > 180d" v={f.unpaid180} on={(v) => set("unpaid180", v)} tid="a-180" />
            <Fld label="3B Filed Late By (days)" v={f.lateDays} on={(v) => set("lateDays", v)} tid="a-late" />
          </div>

          <div className="font-display text-white pt-3">Phase 2 · Multi-Way Variances</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <VarRow label="GSTR-1 vs GSTR-3B (Output Tax gap)" v={c.taxGap} />
            <VarRow label="P&L @18% expected vs GSTR-1 (approx)" v={c.salesGap} muted />
            <VarRow label="ITC (3B) vs GSTR-2B" v={c.itcGap3b_2b} risk />
            <VarRow label="ITC (3B) vs Purchase Register" v={c.itcGap3b_pr} />
          </div>

          <div className="font-display text-white pt-3">Phase 3 · Risk & Rule Checks</div>
          <div className="space-y-2">
            {f.blockedFound > 0 && <RiskRow icon={<AlertTriangle className="w-4 h-4 text-red-300" />} title={`Blocked ITC claimed (Sec 17(5)): ${fmtINR(f.blockedFound)}`} body="Reverse in next 3B or via DRC-03 with interest." tone="red" />}
            {c.rule42 > 0 && <RiskRow icon={<AlertTriangle className="w-4 h-4 text-yellow-300" />} title={`Rule 42/43 reversal likely: ${fmtINR(c.rule42)}`} body="Exempt supplies present — reverse proportional ITC." tone="yellow" />}
            {f.unpaid180 > 0 && <RiskRow icon={<Clock className="w-4 h-4 text-yellow-300" />} title={`180-day rule: reverse ITC ${fmtINR(f.unpaid180)} + interest ${fmtINR(c.interest180)}`} body="Payment overdue beyond 180 days — reverse ITC per Sec 16(2)(d)." tone="yellow" />}
            {f.lateDays > 0 && <RiskRow icon={<Clock className="w-4 h-4 text-red-300" />} title={`Late-filing interest (Sec 50 @18% p.a.): ${fmtINR(c.interestLate)}`} body={`${f.lateDays} days delay in GSTR-3B filing.`} tone="red" />}
            {(f.blockedFound + f.unpaid180 + c.rule42 + f.lateDays === 0) && <RiskRow icon={<ShieldCheck className="w-4 h-4 text-emerald-300" />} title="No systemic ITC risks detected" body="All clear — ITC in 3B ≤ 2B and no blocked credits flagged." tone="emerald" />}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
            <div className="text-[10px] uppercase text-red-300 font-mono-data tracking-widest">Ultimate Additional Liability</div>
            <div className="font-mono-data text-4xl text-red-300 mt-2">{fmtINR(c.netLiability)}</div>
            <div className="text-xs text-red-200 mt-3 leading-relaxed">Bridge this shortfall using <b>Form DRC-03 (Voluntary Payment)</b> — head-wise split (Tax + Interest + Penalty).</div>
          </div>
          <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/[0.04] p-5 text-xs text-zinc-300 leading-relaxed space-y-2">
            <div className="text-cyan-300 font-display text-sm">DRC-03 Draft Split</div>
            <div className="flex justify-between"><span>Tax head (output + blocked ITC)</span><span className="font-mono-data text-white">{fmtINR(Math.max(0, c.taxGap) + Math.max(0, c.itcGap3b_2b) + f.blockedFound)}</span></div>
            <div className="flex justify-between"><span>Interest (Sec 50 + 180d)</span><span className="font-mono-data text-white">{fmtINR(c.interestLate + c.interest180)}</span></div>
            <div className="flex justify-between border-t border-zinc-800 pt-1.5"><span>Total to bridge</span><span className="font-mono-data text-cyan-300">{fmtINR(c.netLiability)}</span></div>
          </div>
        </div>
      </div>

      <AiPanel
        label="AI GST Auditor Actions"
        buildPrompt={() => `Draft an audit note. FY ${fy}, GSTIN ${gstin}. Data: ${JSON.stringify(f)}. Variances & interest: ${JSON.stringify(c)}. Give: Executive Scorecard (bullets), Top-3 immediate fixes, exact DRC-03 head-wise wording, and 2 preventive controls before next period. End with a 1-line disclaimer.`}
      />
    </div>
  );
}
function Fld({ label, v, on, tid }) {
  return (
    <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">{label}</Label><Input data-testid={tid} type="number" value={v} onChange={(e) => on(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
  );
}
function VarRow({ label, v, risk, muted }) {
  const abs = Math.abs(v);
  const tone = abs === 0 ? "emerald" : risk ? "red" : muted ? "zinc" : "yellow";
  const bg = { emerald: "border-emerald-500/25 bg-emerald-500/5 text-emerald-300", red: "border-red-500/25 bg-red-500/5 text-red-300", yellow: "border-yellow-500/25 bg-yellow-500/5 text-yellow-300", zinc: "border-zinc-800 bg-zinc-950 text-zinc-400" }[tone];
  return (
    <div className={`rounded-lg border p-3 flex items-center justify-between ${bg}`}>
      <span className="text-xs">{label}</span>
      <span className="font-mono-data text-sm">{fmtINR(v)}</span>
    </div>
  );
}
function RiskRow({ icon, title, body, tone }) {
  const bg = { red: "border-red-500/25 bg-red-500/5", yellow: "border-yellow-500/25 bg-yellow-500/5", emerald: "border-emerald-500/25 bg-emerald-500/5" }[tone];
  return (
    <div className={`rounded-lg border p-3 flex gap-3 ${bg}`}>
      {icon}
      <div>
        <div className="text-sm text-white">{title}</div>
        <div className="text-xs text-zinc-400 mt-0.5">{body}</div>
      </div>
    </div>
  );
}
