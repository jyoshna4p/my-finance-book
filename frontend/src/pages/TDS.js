import { useMemo, useState } from "react";
import AiPanel from "@/components/AiPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtINR } from "@/lib/taxConfig";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";

const PAYMENT_CODES = [
  { code: 1001, desc: "Salary to employees", thresh: 250000, rate: "Slab" },
  { code: 1015, desc: "Interest other than on securities", thresh: 40000, rate: "10%" },
  { code: 1022, desc: "Payment to contractor / sub-contractor (Individual/HUF)", thresh: 100000, rate: "1%" },
  { code: 1023, desc: "Payment to contractor (Others)", thresh: 100000, rate: "2%" },
  { code: 1034, desc: "Professional / technical services", thresh: 50000, rate: "10%" },
  { code: 1044, desc: "Rent — land / building", thresh: 240000, rate: "10%" },
  { code: 1045, desc: "Rent — plant / machinery", thresh: 240000, rate: "2%" },
  { code: 1055, desc: "Commission / brokerage", thresh: 15000, rate: "5%" },
  { code: 1067, desc: "Payment to non-resident", thresh: 0, rate: "As per DTAA" },
  { code: 1078, desc: "TCS on scrap sale", thresh: 0, rate: "1%" },
  { code: 1092, desc: "TCS on foreign remittance (LRS > ₹10L)", thresh: 1000000, rate: "20%" },
];

const isPanValid = (pan) => /^[A-Z]{5}\d{4}[A-Z]$/.test(pan || "");

export default function TDS() {
  const [rows, setRows] = useState(() => [
    { rid: "seed-1", vendor: "ABC Contractor", pan: "AABCA1234E", code: 1022, ytd: 85000, amt: 25000 },
    { rid: "seed-2", vendor: "XYZ Consulting", pan: "", code: 1034, ytd: 45000, amt: 15000 },
    { rid: "seed-3", vendor: "Rentwell LLP", pan: "AAAFR9876Q", code: 1044, ytd: 220000, amt: 30000 },
  ]);
  const [newRow, setNewRow] = useState({ vendor: "", pan: "", code: 1022, ytd: 0, amt: 0 });

  const codes = useMemo(() => Object.fromEntries(PAYMENT_CODES.map((c) => [c.code, c])), []);

  const compute = (r) => {
    const meta = codes[r.code];
    const rateN = meta.rate === "Slab" ? 0.1 : meta.rate === "As per DTAA" ? 0.2 : parseFloat(meta.rate) / 100;
    const effective = !isPanValid(r.pan) ? 0.20 : rateN;
    const tds = Math.round(r.amt * effective);
    const cumulative = r.ytd + r.amt;
    const approaching = meta.thresh && cumulative > meta.thresh * 0.85;
    const exceeded = meta.thresh && cumulative >= meta.thresh;
    return { effective, tds, cumulative, approaching, exceeded, meta };
  };

  const addRow = () => {
    if (!newRow.vendor) return;
    setRows((r) => [...r, { ...newRow, rid: `r-${Date.now()}`, code: Number(newRow.code) }]);
    setNewRow({ vendor: "", pan: "", code: 1022, ytd: 0, amt: 0 });
  };

  return (
    <div className="space-y-6" data-testid="tds-page">
      <div>
        <div className="text-xs font-mono-data text-cyan-300 uppercase tracking-widest">Section 5</div>
        <h1 className="font-display text-4xl text-white mt-1 tracking-tight">TDS / TCS Compliance Ledger</h1>
        <p className="text-zinc-500 mt-2 text-sm">Tax Year (TY) 2026-27 · Income Tax Act, 2025 · new numeric Payment Codes (1001-1092) · Form 140 / 131 quarterly output.</p>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-500 text-[11px] uppercase font-mono-data">
            <tr><th className="text-left px-4 py-3">Vendor</th><th>PAN</th><th>Payment Code</th><th>YTD Paid</th><th>This Payment</th><th>Rate</th><th>TDS</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const c = compute(r);
              const panBad = !isPanValid(r.pan);
              return (
                <tr key={r.rid} className="border-t border-zinc-800 text-zinc-300">
                  <td className="px-4 py-2 font-display">{r.vendor}</td>
                  <td className={`text-center font-mono-data ${panBad ? "text-red-400" : "text-zinc-300"}`}>{r.pan || "— missing —"}</td>
                  <td className="text-center font-mono-data text-cyan-300">{r.code} <span className="text-[10px] text-zinc-500 block">{c.meta.desc}</span></td>
                  <td className="text-center font-mono-data">{fmtINR(r.ytd)}</td>
                  <td className="text-center font-mono-data">{fmtINR(r.amt)}</td>
                  <td className={`text-center font-mono-data ${panBad ? "text-red-400" : "text-zinc-300"}`}>{(c.effective * 100).toFixed(1)}%{panBad && <span className="text-[10px] block">PAN → 20%</span>}</td>
                  <td className="text-center font-mono-data text-white">{fmtINR(c.tds)}</td>
                  <td className="text-center">{c.exceeded ? <Badge className="bg-red-500/15 text-red-300 border border-red-500/25">Threshold hit</Badge> : c.approaching ? <Badge className="bg-yellow-500/15 text-yellow-300 border border-yellow-500/25">85% reached</Badge> : <Badge className="bg-zinc-800 text-zinc-400">OK</Badge>}</td>
                  <td><Button size="sm" variant="ghost" onClick={() => setRows((rs) => rs.filter((x) => x.rid !== r.rid))}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="p-4 border-t border-zinc-800 flex flex-wrap gap-2 items-end">
          <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Vendor</Label><Input data-testid="v-name" value={newRow.vendor} onChange={(e) => setNewRow({ ...newRow, vendor: e.target.value })} className="mt-1 bg-zinc-950 border-zinc-800 text-white w-40" /></div>
          <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">PAN</Label><Input data-testid="v-pan" value={newRow.pan} onChange={(e) => setNewRow({ ...newRow, pan: e.target.value.toUpperCase() })} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data w-32" /></div>
          <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Code</Label>
            <select data-testid="v-code" value={newRow.code} onChange={(e) => setNewRow({ ...newRow, code: Number(e.target.value) })} className="mt-1 block bg-zinc-950 border border-zinc-800 rounded-md px-2 py-2 text-white text-xs">
              {PAYMENT_CODES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.desc}</option>)}
            </select></div>
          <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">YTD</Label><Input data-testid="v-ytd" type="number" value={newRow.ytd} onChange={(e) => setNewRow({ ...newRow, ytd: Number(e.target.value) })} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data w-28" /></div>
          <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Amount</Label><Input data-testid="v-amt" type="number" value={newRow.amt} onChange={(e) => setNewRow({ ...newRow, amt: Number(e.target.value) })} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data w-28" /></div>
          <Button data-testid="v-add" onClick={addRow} className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
      </div>

      {rows.some((r) => !isPanValid(r.pan)) && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-300 shrink-0" />
          <div className="text-xs text-red-200 leading-relaxed">One or more vendors have missing / invalid PAN. Under the new IT Act 2025, deduct TDS at a hard 20% rate irrespective of the code.</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <div className="font-display text-white">Payment Code Directory</div>
          <div className="mt-3 max-h-64 overflow-auto text-xs space-y-1.5">
            {PAYMENT_CODES.map((c) => (
              <div key={c.code} className="flex items-start justify-between gap-2 pb-1.5 border-b border-zinc-800/70">
                <div><div className="text-cyan-300 font-mono-data">{c.code}</div><div className="text-zinc-400">{c.desc}</div></div>
                <div className="text-right"><div className="font-mono-data text-white">{c.rate}</div><div className="text-[10px] text-zinc-500 font-mono-data">≥ ₹{c.thresh.toLocaleString("en-IN")}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 col-span-1 lg:col-span-2">
          <div className="font-display text-white mb-3">Quarterly Form 140 / 131 preview</div>
          <pre className="text-[11px] font-mono-data text-emerald-200 leading-relaxed bg-zinc-950 border border-zinc-800 rounded-lg p-4 whitespace-pre-wrap overflow-auto">
{`FORM 140  ·  Non-Salary TDS  ·  Quarter Q3 (Oct-Dec) TY 2026-27
Deductor: My Finance Book Pvt Ltd  ·  TAN: MUMM12345A
`}{rows.map((r) => `${r.pan.padEnd(11, ".")} | code ${r.code} | paid ${fmtINR(r.amt).padEnd(14)} | TDS ${fmtINR(compute(r).tds)}`).join("\n")}
          </pre>
        </div>
      </div>

      <AiPanel
        label="AI TDS Advisor"
        buildPrompt={() => `Under IT Act 2025 (TY 2026-27), review this TDS ledger: ${JSON.stringify(rows)}. Identify (a) vendors approaching thresholds, (b) PAN gaps causing 20% higher deduction, (c) suggested corrective advisories to send vendors. Reference the numeric payment codes.`}
      />
    </div>
  );
}
