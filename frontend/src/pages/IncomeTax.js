import { useMemo, useState } from "react";
import { computeTax, fmtINR, suggestITR, TAX_YEARS, taxConfig, DEDUCTION_CAPS } from "@/lib/taxConfig";
import Stepper from "@/components/Stepper";
import AiPanel from "@/components/AiPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, FileCheck, Lightbulb, ArrowRight, ArrowLeft } from "lucide-react";

const STEPS = ["Income Profile", "Regime Compare", "Filing Guide", "AI Review"];

const SOURCES = [
  { k: "salary", n: "Salary" },
  { k: "houseRent", n: "House Rent Income" },
  { k: "savings", n: "Savings Interest" },
  { k: "fd", n: "Fixed Deposit Interest" },
  { k: "capitalGains", n: "Capital Gains (Stocks/MF)" },
  { k: "business", n: "Business Income" },
  { k: "freelance", n: "Freelance / Profession" },
  { k: "presumptive", n: "Presumptive (44AD/ADA/AE)" },
  { k: "crypto", n: "Crypto / VDA" },
  { k: "agriculture", n: "Agricultural Income" },
  { k: "multipleHouse", n: "More than 1 House" },
  { k: "foreign", n: "Foreign Income / Assets" },
];

const FILING_STEPS = [
  { s: "Login to Income Tax e-Filing portal", d: "Use your PAN as User ID at incometax.gov.in — enable 2FA via Aadhaar OTP." },
  { s: "Navigate to e-File → Income Tax Returns → File Return", d: "Pick the current Assessment Year (AY) matching your selected year here." },
  { s: "Select filing Mode & Status", d: "Mode: Online. Status: Individual / HUF as applicable." },
  { s: "Choose ITR Form", d: "System has already picked your form from Step 1. Verify it matches." },
  { s: "Validate pre-filled data", d: "Check Salary (26AS), Interest (AIS/TIS), Capital Gains, Deductions. Correct mismatches vs Form 16/16A." },
  { s: "Match refund/tax due to our computation", d: "The portal's final tax should match the number on Step 2 of this wizard." },
  { s: "Enter bank account for refund", d: "Only pre-validated bank accounts can receive refunds — link via 'My Bank Accounts'." },
  { s: "Preview → Submit → E-Verify within 30 days", d: "Use Aadhaar OTP or Net-banking EVC. Non-verified returns are treated as not filed." },
];

export default function IncomeTax() {
  const [step, setStep] = useState(0);
  const [year, setYear] = useState("2026-27");
  const [sources, setSources] = useState(["salary", "savings"]);
  const [gross, setGross] = useState(1500000);
  const [other, setOther] = useState(45000);
  const [tds, setTds] = useState(120000);
  const [ded, setDed] = useState({ "80C": 150000, "80D": 25000, "80TTA": 10000, "24b": 200000, HRA: 0, "80G": 0 });
  const [regime, setRegime] = useState("new");

  const totalGross = Number(gross) + Number(other || 0);
  const oldResult = useMemo(() => computeTax({ gross: totalGross, regime: "old", year, deductions: ded, tdsPaid: tds }), [totalGross, ded, tds, year]);
  const newResult = useMemo(() => computeTax({ gross: totalGross, regime: "new", year, deductions: {}, tdsPaid: tds }), [totalGross, tds, year]);
  const itr = useMemo(() => suggestITR(sources), [sources]);
  const allowed = taxConfig[year][regime].allowedDeductions;

  const loopholes = useMemo(() => {
    const arr = [];
    if (sources.includes("savings") && !ded["80TTA"]) arr.push("Loophole Found: Claim Section 80TTA up to ₹10,000 on savings interest.");
    if (!ded["80D"]) arr.push("Missed deduction: Section 80D — up to ₹25,000 (₹50,000 for senior parents) medical premium.");
    if (sources.includes("houseRent") && (ded["HRA"] || 0) === 0 && regime === "old") arr.push("Maximize Refund: If you pay rent, claim HRA under the Old Regime with rent receipts.");
    if (oldResult && newResult && oldResult.total < newResult.total) arr.push(`Old Regime saves you ${fmtINR(newResult.total - oldResult.total)} — switch regime.`);
    if (newResult && oldResult && newResult.total < oldResult.total) arr.push(`New Regime saves you ${fmtINR(oldResult.total - newResult.total)} — default is optimal.`);
    return arr;
  }, [ded, sources, regime, oldResult, newResult]);

  const cheaper = oldResult && newResult ? (oldResult.total <= newResult.total ? "old" : "new") : "new";

  const setDedField = (k, v) => setDed((d) => ({ ...d, [k]: Number(v) }));

  return (
    <div className="space-y-6" data-testid="income-tax-page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-mono-data text-cyan-300 uppercase tracking-widest">Section 1</div>
          <h1 className="font-display text-4xl text-white mt-1 tracking-tight">Income Tax Portal</h1>
          <p className="text-zinc-500 mt-2 text-sm">Old vs New regime for FY 2023-24 through FY 2026-27 — configured live from a year-indexed rules table.</p>
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono-data">Financial Year</Label>
          <select
            data-testid="fy-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 block bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white font-mono-data"
          >
            {TAX_YEARS.map((y) => <option key={y.fy} value={y.fy}>FY {y.fy} · AY {y.ay}</option>)}
          </select>
        </div>
      </div>

      <Stepper steps={STEPS} active={step} onSelect={setStep} />

      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-display text-white text-lg">Select all applicable income sources</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
              {SOURCES.map((s) => (
                <label key={s.k} data-testid={`src-${s.k}`} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${sources.includes(s.k) ? "border-cyan-500/40 bg-cyan-500/10" : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"}`}>
                  <Checkbox
                    checked={sources.includes(s.k)}
                    onCheckedChange={(v) =>
                      setSources((cur) => v ? [...cur, s.k] : cur.filter((x) => x !== s.k))
                    }
                  />
                  <span className="text-sm text-zinc-200">{s.n}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sources.map((k) => {
                const isExempt = k === "agriculture";
                return (
                  <div key={k} className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${isExempt ? "border-emerald-500/25 bg-emerald-500/[0.05]" : "border-red-500/25 bg-red-500/[0.05]"}`}>
                    <span className="text-sm text-white">{SOURCES.find((s) => s.k === k)?.n}</span>
                    <Badge className={isExempt ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}>
                      {isExempt ? "Exempt" : "Taxable"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-cyan-500/30 rounded-xl p-6">
            <div className="text-[11px] font-mono-data uppercase text-cyan-300 tracking-widest">Recommended ITR Form</div>
            <div className="font-display text-3xl text-white mt-2">{itr.form}</div>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{itr.why}</p>
            <Button data-testid="next-1" onClick={() => setStep(1)} className="mt-6 w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950">Next: Regime Compare <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 text-cyan-300 mb-4"><Upload className="w-4 h-4" /><span className="font-display text-sm">Document Upload</span></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Form 16", "Form 26AS", "AIS/TIS", "Rent Receipts"].map((d) => (
                  <div key={d} className="border border-dashed border-zinc-700 rounded-lg p-4 text-center text-xs text-zinc-500 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors cursor-pointer">
                    <FileCheck className="w-5 h-5 mx-auto mb-1" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
              <div className="font-display text-white mb-4">Income & Deductions</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Gross Salary" value={gross} onChange={setGross} tid="gross" />
                <Field label="Other Income" value={other} onChange={setOther} tid="other" />
                <Field label="TDS Already Paid" value={tds} onChange={setTds} tid="tds" />
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono-data">Regime</Label>
                  <div className="mt-2 flex gap-2">
                    {["new", "old"].map((r) => (
                      <button key={r} data-testid={`reg-${r}`} onClick={() => setRegime(r)} className={`flex-1 px-3 py-2 rounded-md text-xs font-display border ${regime === r ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" : "border-zinc-800 text-zinc-400 hover:text-white"}`}>{r === "new" ? "New (default)" : "Old"}</button>
                    ))}
                  </div>
                </div>
                {allowed.map((k) => (
                  <Field key={k} label={`${k} (max ${DEDUCTION_CAPS[k] === Infinity ? "no cap" : fmtINR(DEDUCTION_CAPS[k])})`} value={ded[k] || 0} onChange={(v) => setDedField(k, v)} tid={`ded-${k}`} />
                ))}
                {!allowed.length && <div className="text-xs text-zinc-500 col-span-2 md:col-span-3">New Regime — deductions like 80C/80D/HRA are not applicable (except NPS 80CCD(2) via employer).</div>}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <ResultCard title={`Old Regime — FY ${year}`} r={oldResult} highlight={cheaper === "old"} />
            <ResultCard title={`New Regime — FY ${year}`} r={newResult} highlight={cheaper === "new"} />
            {loopholes.length > 0 && (
              <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/5 p-5">
                <div className="flex items-center gap-2 text-yellow-300 mb-2"><Lightbulb className="w-4 h-4" /><span className="font-display text-sm">Refund Maximizer</span></div>
                <ul className="text-xs text-zinc-300 space-y-1.5 leading-relaxed">
                  {loopholes.map((l, i) => <li key={i}>· {l}</li>)}
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)} className="border-zinc-700 text-zinc-300"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
              <Button data-testid="next-2" onClick={() => setStep(2)} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950">Filing Guide <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h3 className="font-display text-white text-lg">Step-by-step filing on incometax.gov.in</h3>
          <ol className="mt-5 space-y-3">
            {FILING_STEPS.map((f, i) => (
              <li key={i} className="flex gap-4 p-4 border border-zinc-800 rounded-lg bg-zinc-950/40">
                <span className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono-data flex items-center justify-center shrink-0">{i + 1}</span>
                <div>
                  <div className="font-display text-white text-sm">{f.s}</div>
                  <div className="text-xs text-zinc-400 mt-1 leading-relaxed">{f.d}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="border-zinc-700 text-zinc-300"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
            <Button data-testid="next-3" onClick={() => setStep(3)} className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950">AI Review <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <AiPanel
          label="AI Tax Review (Claude 4.5 · GPT-5.2)"
          buildPrompt={() => `Financial Year: ${year}. ITR: ${itr.form}. Sources: ${sources.join(", ")}. Gross salary ${gross}, other ${other}, TDS ${tds}, deductions ${JSON.stringify(ded)}. Cheaper regime = ${cheaper}. Old total tax ${oldResult?.total}, New total tax ${newResult?.total}. Give me: (1) 3 concrete optimisation actions before 31 March, (2) any red flags in my declared numbers vs AIS, (3) a quick "should I switch regime?" verdict with the exact rupee delta.`}
        />
      )}
    </div>
  );
}

function Field({ label, value, onChange, tid }) {
  return (
    <div>
      <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono-data">{label}</Label>
      <Input data-testid={tid} type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" />
    </div>
  );
}

function ResultCard({ title, r, highlight }) {
  if (!r) return null;
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "border-cyan-500/40 bg-cyan-500/[0.05]" : "border-zinc-800 bg-zinc-900/60"}`}>
      <div className="flex items-center justify-between">
        <div className="font-display text-sm text-white">{title}</div>
        {highlight && <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Cheaper</Badge>}
      </div>
      <div className="mt-4 space-y-1.5 text-sm">
        <Row label="Taxable Income" value={fmtINR(r.taxable)} />
        <Row label="Tax (Slabs)" value={fmtINR(r.tax)} />
        <Row label="Health & Edu Cess 4%" value={fmtINR(r.cess)} />
        <Row label="Total Tax" value={fmtINR(r.total)} bold />
        <div className={`mt-3 p-3 rounded-lg text-center ${r.refund > 0 ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300" : "bg-red-500/10 border border-red-500/25 text-red-300"}`}>
          <div className="text-[10px] uppercase tracking-widest font-mono-data">{r.refund > 0 ? "Expected Refund" : "Tax Due"}</div>
          <div className="font-mono-data text-2xl mt-1">{fmtINR(r.refund > 0 ? r.refund : r.due)}</div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-mono-data ${bold ? "text-white font-semibold" : "text-zinc-300"}`}>{value}</span>
    </div>
  );
}
