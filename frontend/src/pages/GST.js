import { useMemo, useState } from "react";
import Stepper from "@/components/Stepper";
import AiPanel from "@/components/AiPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtINR } from "@/lib/taxConfig";
import { AlertTriangle, ArrowRight, ArrowLeft, ShieldAlert, TrendingDown, Info } from "lucide-react";

const STEPS = ["Supply Profile", "GST Calculator", "Blocked Credits", "Filing Guide"];

const PROFILE = [
  { k: "b2b", n: "Sells B2B" },
  { k: "b2c", n: "Sells B2C" },
  { k: "export", n: "Exports goods/services" },
  { k: "composition", n: "Composition Scheme" },
  { k: "rcm", n: "Reverse Charge (RCM)" },
  { k: "ecom", n: "E-commerce operator" },
];

const FILING_PHASES = [
  {
    p: "Phase 1 · GSTR-1 (Sales Detail)",
    steps: [
      "Services → Returns → Return Dashboard → Pick FY / month.",
      "Open GSTR-1 → Prepare Online.",
      "Table 4A: Add invoice-wise B2B sales (invoice #, GSTIN, tax).",
      "Table 7: Add aggregate B2C sales (state-wise).",
      "Generate Summary → File with DSC or EVC OTP by 11th.",
    ],
  },
  {
    p: "Phase 2 · GSTR-2B (Auto)",
    steps: [
      "Wait for 14th of the month.",
      "Download GSTR-2B — the static, auto-drafted ITC statement.",
      "Compare with your purchase register. Chase suppliers whose invoices are missing.",
    ],
  },
  {
    p: "Phase 3 · GSTR-3B (Summary + Payment)",
    steps: [
      "Open GSTR-3B tile.",
      "Table 3.1 auto-populates from GSTR-1. Verify sales liability.",
      "Table 4 (Eligible ITC) auto-fills from GSTR-2B. Reduce blocked ITC (17(5)).",
      "Offset liability using Electronic Credit Ledger first; balance via Cash Ledger.",
      "Generate Payment Challan, pay via Net-banking / UPI, file with EVC OTP by 20th.",
    ],
  },
];

export default function GST() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(["b2b", "b2c"]);
  const [sales, setSales] = useState({ 5: 0, 12: 500000, 18: 2200000, 28: 0 });
  const [purchases, setPurchases] = useState(1650000);
  const [itcClaimed, setItcClaimed] = useState(280000);
  const [itc2b, setItc2b] = useState(260000);
  const [blockedFlags, setBlockedFlags] = useState({ car: false, food: false, club: false, construction: false });
  const [supplierOld, setSupplierOld] = useState(false);

  const grossOutput = useMemo(() => {
    return Object.entries(sales).reduce((a, [rate, val]) => a + Number(val || 0) * (Number(rate) / 100), 0);
  }, [sales]);
  const eligibleItc = Math.min(Number(itcClaimed || 0), Number(itc2b || 0));
  const excessClaim = Math.max(0, Number(itcClaimed || 0) - Number(itc2b || 0));
  const cashPayable = Math.max(0, grossOutput - eligibleItc);
  const forms = useMemo(() => {
    if (profile.includes("composition")) return ["CMP-08 (Quarterly)", "GSTR-4 (Annual)"];
    return ["GSTR-1 (by 11th)", "GSTR-3B (by 20th)", "GSTR-9 (Annual, by 31 Dec)"];
  }, [profile]);

  const blockedItems = [];
  if (blockedFlags.car) blockedItems.push("Motor Vehicles (≤13 seat) — Section 17(5)(a)");
  if (blockedFlags.food) blockedItems.push("Food, Beverages, Outdoor Catering — Section 17(5)(b)(i)");
  if (blockedFlags.club) blockedItems.push("Club, Health & Fitness — Section 17(5)(b)(ii)");
  if (blockedFlags.construction) blockedItems.push("Works Contract for immovable property — Section 17(5)(c)");

  return (
    <div className="space-y-6" data-testid="gst-page">
      <div>
        <div className="text-xs font-mono-data text-cyan-300 uppercase tracking-widest">Section 2</div>
        <h1 className="font-display text-4xl text-white mt-1 tracking-tight">GST Returns & Smart Portal</h1>
        <p className="text-zinc-500 mt-2 text-sm">B2B/B2C profiling · ITC optimizer with 100% GSTR-2B matching · Section 17(5) blocked-credit detector · full filing playbook.</p>
      </div>

      <Stepper steps={STEPS} active={step} onSelect={setStep} />

      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-display text-white text-lg">Tell us how you sell</h3>
            <div className="grid grid-cols-2 gap-3 mt-5">
              {PROFILE.map((s) => (
                <label key={s.k} data-testid={`prof-${s.k}`} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer ${profile.includes(s.k) ? "border-cyan-500/40 bg-cyan-500/10" : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"}`}>
                  <Checkbox checked={profile.includes(s.k)} onCheckedChange={(v) => setProfile((cur) => v ? [...cur, s.k] : cur.filter((x) => x !== s.k))} />
                  <span className="text-sm text-zinc-200">{s.n}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-cyan-500/30 rounded-xl p-6">
            <div className="text-[11px] font-mono-data uppercase text-cyan-300 tracking-widest">Mandated Forms</div>
            <ul className="mt-3 space-y-2">
              {forms.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />{f}
                </li>
              ))}
            </ul>
            <Button data-testid="gst-next-1" onClick={() => setStep(1)} className="mt-5 w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950">GST Calculator <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-6">
            <div>
              <div className="font-display text-white">Outward Supplies (Sales)</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {[5, 12, 18, 28].map((r) => (
                  <div key={r}>
                    <Label className="text-[10px] uppercase text-zinc-500 font-mono-data">Slab {r}%</Label>
                    <Input data-testid={`sales-${r}`} type="number" value={sales[r]} onChange={(e) => setSales((s) => ({ ...s, [r]: Number(e.target.value) }))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-display text-white">Inward Purchases</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                <div><Label className="text-[10px] uppercase text-zinc-500 font-mono-data">Total Purchases</Label><Input data-testid="purchases" type="number" value={purchases} onChange={(e) => setPurchases(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
                <div><Label className="text-[10px] uppercase text-zinc-500 font-mono-data">ITC You Want To Claim</Label><Input data-testid="itc-claim" type="number" value={itcClaimed} onChange={(e) => setItcClaimed(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
                <div><Label className="text-[10px] uppercase text-zinc-500 font-mono-data">ITC Available in GSTR-2B</Label><Input data-testid="itc-2b" type="number" value={itc2b} onChange={(e) => setItc2b(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="text-[11px] uppercase font-mono-data text-zinc-500 tracking-widest">Gross Output GST</div>
              <div className="font-mono-data text-2xl text-white mt-1">{fmtINR(grossOutput)}</div>
              <div className="text-[11px] uppercase font-mono-data text-zinc-500 tracking-widest mt-4">Eligible ITC</div>
              <div className="font-mono-data text-2xl text-emerald-400 mt-1">{fmtINR(eligibleItc)}</div>
              <div className={`mt-4 rounded-lg p-3 ${cashPayable > 0 ? "bg-red-500/10 border border-red-500/25" : "bg-emerald-500/10 border border-emerald-500/25"}`}>
                <div className="text-[10px] uppercase font-mono-data tracking-widest">Net Cash GST Payable</div>
                <div className={`font-mono-data text-3xl mt-1 ${cashPayable > 0 ? "text-red-300" : "text-emerald-300"}`}>{fmtINR(cashPayable)}</div>
              </div>
            </div>
            {excessClaim > 0 && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-300 shrink-0" />
                <div className="text-xs text-red-200 leading-relaxed"><b>Illegal provisional ITC of {fmtINR(excessClaim)}.</b> Rule 36(4) permits only ITC visible in GSTR-2B. Claiming more risks Section 73/74 notices.</div>
              </div>
            )}
            <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(0)} className="border-zinc-700 text-zinc-300"><ArrowLeft className="w-4 h-4 mr-1" /></Button><Button data-testid="gst-next-2" onClick={() => setStep(2)} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950">Next <ArrowRight className="w-4 h-4 ml-1" /></Button></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-display text-white text-lg flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-yellow-300" />Do any of these apply to your purchases?</h3>
            <div className="mt-4 space-y-2">
              {[
                ["car", "Passenger motor vehicles (≤13 seats)"],
                ["food", "Food, beverages, outdoor catering"],
                ["club", "Club / health / gym memberships"],
                ["construction", "Building construction expenses"],
              ].map(([k, n]) => (
                <label key={k} data-testid={`blk-${k}`} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/40">
                  <Checkbox checked={blockedFlags[k]} onCheckedChange={(v) => setBlockedFlags((f) => ({ ...f, [k]: !!v }))} />
                  <span className="text-sm text-zinc-200">{n}</span>
                </label>
              ))}
              <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/40">
                <Checkbox checked={supplierOld} onCheckedChange={setSupplierOld} />
                <span className="text-sm text-zinc-200">Any supplier invoice unpaid beyond 180 days?</span>
              </label>
            </div>
          </div>
          <div className="space-y-3">
            {blockedItems.length > 0 && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
                <div className="flex items-center gap-2 text-red-300 mb-2"><AlertTriangle className="w-4 h-4" /><span className="font-display text-sm">Blocked Credits (Section 17(5))</span></div>
                <ul className="text-xs text-zinc-300 space-y-1.5 leading-relaxed">
                  {blockedItems.map((b) => <li key={b}>· {b}</li>)}
                </ul>
                <div className="text-[11px] text-red-200 mt-3">Remove these from ITC or expect notices under Section 73/74.</div>
              </div>
            )}
            {supplierOld && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 flex gap-3">
                <TrendingDown className="w-4 h-4 text-yellow-300" />
                <div className="text-xs text-yellow-200 leading-relaxed">180-day rule: Pay supplier within 180 days or reverse the ITC with 18% p.a. interest under Section 16(2)(d).</div>
              </div>
            )}
            <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/[0.04] p-5 flex gap-3">
              <Info className="w-4 h-4 text-cyan-300" />
              <div className="text-xs text-zinc-300 leading-relaxed">Cross-check your Purchase Register against GSTR-2B every 14th. If a supplier hasn't uploaded, contact them before 20th to safeguard ITC.</div>
            </div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(1)} className="border-zinc-700 text-zinc-300"><ArrowLeft className="w-4 h-4 mr-1" /></Button><Button data-testid="gst-next-3" onClick={() => setStep(3)} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950">Filing Guide <ArrowRight className="w-4 h-4 ml-1" /></Button></div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-xs text-red-200"><b>Strict rule:</b> If GSTR-3B is not filed for a month, the portal will block GSTR-1 filing for the next month. File in strict phase order.</div>
          {FILING_PHASES.map((p) => (
            <div key={p.p} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
              <div className="font-display text-white">{p.p}</div>
              <ol className="mt-4 space-y-2">
                {p.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-300">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono-data flex items-center justify-center shrink-0">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <AiPanel
            label="AI GST Consultant"
            buildPrompt={() => `GST review for FY 2025-26. Profile: ${profile.join(", ")}. Sales by slab: ${JSON.stringify(sales)}. Purchases ${purchases}, ITC claimed ${itcClaimed}, GSTR-2B ITC ${itc2b}. Blocked flags: ${JSON.stringify(blockedFlags)}, supplier unpaid >180d: ${supplierOld}. Give 3 optimizations, 2 red flags, and a suggested DRC-03 amount if any excess ITC.`}
          />
        </div>
      )}
    </div>
  );
}
