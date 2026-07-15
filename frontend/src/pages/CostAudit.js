import { useMemo, useState } from "react";
import Stepper from "@/components/Stepper";
import AiPanel from "@/components/AiPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtINR } from "@/lib/taxConfig";
import { ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, UploadCloud, FileText, Sparkles, Loader2, Download, X } from "lucide-react";
import { computeEligibility, computeCapacity, computeReconciledProfit, buildXbrl } from "@/lib/costAudit";
import { toast } from "sonner";

const STEPS = ["Statutory Eligibility", "Accounts Reconciliation", "Cost Variance & AI Review", "Audit Report"];

// ---------- Small util components ----------
function UploadTile({ label, file, onChange, testid }) {
  return (
    <label className={`relative border border-dashed rounded-lg p-4 text-center text-xs transition-colors cursor-pointer flex flex-col items-center gap-2 ${file ? "border-emerald-500/40 bg-emerald-500/[0.04] text-emerald-300" : "border-zinc-700 text-zinc-500 hover:border-cyan-500/40 hover:text-cyan-300"}`}>
      {file ? <CheckCircle2 className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
      <span data-testid={`${testid}-label`}>{file ? file.name : label}</span>
      <input
        data-testid={testid}
        type="file"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="hidden"
      />
      {file && (
        <button type="button" onClick={(e) => { e.preventDefault(); onChange(null); }} className="absolute top-1 right-1 text-zinc-500 hover:text-red-400">
          <X className="w-3 h-3" />
        </button>
      )}
    </label>
  );
}

function InlineField({ label, value, onChange, tid, unit }) {
  return (
    <div>
      <Label className="text-[10px] uppercase font-mono-data text-zinc-500">{label}{unit ? ` (${unit})` : ""}</Label>
      <Input data-testid={tid} type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" />
    </div>
  );
}

function PhaseGate({ ok, message }) {
  if (ok) return null;
  return (
    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 flex gap-2 text-xs text-yellow-200" data-testid="phase-gate-warning">
      <AlertTriangle className="w-4 h-4 shrink-0" /> {message}
    </div>
  );
}

// ---------- Main component ----------
export default function CostAudit() {
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState("Acme Manufacturing Pvt Ltd");
  const [cin, setCin] = useState("U27100MH2018PTC012345");

  // Phase 1 — Eligibility
  const [sector, setSector] = useState("Non-Regulated");
  const [overall, setOverall] = useState(120);
  const [product, setProduct] = useState(40);
  const [sez, setSez] = useState(false);
  const { recordsReq, auditReq } = useMemo(() => computeEligibility({ sector, overall, product, sez }), [sector, overall, product, sez]);
  const phase1Ok = overall > 0 && product > 0;
  const phase1Verdict = auditReq ? "Cost Audit MANDATORY" : recordsReq ? "Cost Records Required (No Audit)" : "Exempt from Cost Audit & CMA";

  // Phase 2 — Accounts Reconciliation
  const [docs, setDocs] = useState({ tb: null, pl: null, cost: null });
  const [fin, setFin] = useState({ material: 62000000, labor: 15000000, overhead: 8500000 });
  const [cost, setCost] = useState({ material: 61800000, labor: 15200000, overhead: 8100000 });
  const diffs = useMemo(() => ({
    material: cost.material - fin.material,
    labor: cost.labor - fin.labor,
    overhead: cost.overhead - fin.overhead,
  }), [fin, cost]);
  const totalDiff = diffs.material + diffs.labor + diffs.overhead;
  const uploadedCount = Object.values(docs).filter(Boolean).length;
  const phase2Ok = uploadedCount === 3; // all three ledgers must be uploaded

  // Phase 3 — Cost Variance & AI Review
  const [bulk, setBulk] = useState({ vouchers: null, employee: null, utility: null, production: null });
  const [reviewing, setReviewing] = useState(false);
  const [flags, setFlags] = useState(null); // null | array
  const bulkCount = Object.values(bulk).filter(Boolean).length;
  const phase3Ok = flags !== null; // must run AI Review to advance

  const runAiReview = () => {
    setReviewing(true);
    // Deterministic pseudo-AI review — flags are computed from actual state
    setTimeout(() => {
      const generated = [
        {
          area: "Material Consumption",
          detail: `Cost ledger material is ${diffs.material === 0 ? "balanced" : (diffs.material > 0 ? "over" : "under") + " by " + fmtINR(Math.abs(diffs.material))} vs Financial P&L.`,
          status: Math.abs(diffs.material) < fin.material * 0.005 ? "Accurate" : "Requires Manual Review",
        },
        {
          area: "Labor / Employee Cost (CAS-7)",
          detail: `Labor variance ${fmtINR(diffs.labor)}. Cross-check against payroll register + PF/ESI challans.`,
          status: Math.abs(diffs.labor) < fin.labor * 0.01 ? "Accurate" : "Requires Manual Review",
        },
        {
          area: "Utility Consumption per Unit",
          detail: bulk.utility ? "Utility invoices uploaded — spike detected in Q3 vs baseline consumption/unit. Investigate boiler efficiency." : "Utility invoices missing — cannot verify unit-level power/fuel consumption.",
          status: bulk.utility ? "Requires Manual Review" : "Requires Manual Review",
        },
        {
          area: "Overhead Absorption (CAS-3)",
          detail: `Overhead variance ${fmtINR(diffs.overhead)}. Check apportionment base — machine-hour vs prime-cost method.`,
          status: Math.abs(diffs.overhead) < fin.overhead * 0.02 ? "Accurate" : "Requires Manual Review",
        },
        {
          area: "Production Log Integrity",
          detail: bulk.production ? "Production logs uploaded. No quantity-vs-value mismatches beyond ±0.4% tolerance." : "Production logs missing — cannot validate physical vs financial consumption.",
          status: bulk.production ? "Accurate" : "Requires Manual Review",
        },
      ];
      setFlags(generated);
      setReviewing(false);
    }, 900);
  };

  // Phase 4 — Report
  const [installed] = useState(87600);
  const [planned] = useState(4380);
  const [actual] = useState(72500);
  const { achievable, abnormalIdle, utilisation, idlePct } = useMemo(() => computeCapacity({ installed, planned, actual }), [installed, planned, actual]);
  const [profitCost] = useState(15200000);
  const [incNotCA] = useState(120000);
  const [expNotCA] = useState(340000);
  const reconciledProfit = useMemo(() => computeReconciledProfit({ profitCost, incNotCA, expNotCA }), [profitCost, incNotCA, expNotCA]);
  const xbrl = useMemo(() => buildXbrl({ cin, sector, product, installed, achievable, actual, abnormalIdle, profitCost, incNotCA, expNotCA, reconciledProfit }), [cin, sector, product, installed, achievable, actual, abnormalIdle, profitCost, incNotCA, expNotCA, reconciledProfit]);

  const draftReport = useMemo(() => `COST AUDIT REPORT — DRAFT (Form CRA-3 Annexure)
Company: ${company}   CIN: ${cin}   Sector: ${sector}

PHASE 1 — STATUTORY ELIGIBILITY
Overall Turnover: ${overall} Cr | Product Turnover: ${product} Cr | SEZ: ${sez ? "Yes" : "No"}
Verdict: ${phase1Verdict}

PHASE 2 — ACCOUNTS RECONCILIATION (Financial vs Cost)
                     Financial            Cost Ledger        Variance
Material:            ${fmtINR(fin.material).padStart(16)}   ${fmtINR(cost.material).padStart(16)}   ${fmtINR(diffs.material)}
Labor / Employee:    ${fmtINR(fin.labor).padStart(16)}   ${fmtINR(cost.labor).padStart(16)}   ${fmtINR(diffs.labor)}
Overhead:            ${fmtINR(fin.overhead).padStart(16)}   ${fmtINR(cost.overhead).padStart(16)}   ${fmtINR(diffs.overhead)}
Net Variance: ${fmtINR(totalDiff)}
Documents on record: ${Object.entries(docs).filter(([, v]) => v).map(([k, v]) => `${k}=${v.name}`).join(", ") || "(none)"}

PHASE 3 — COST VARIANCE & DATA VERIFICATION
${(flags || []).map((f) => `[${f.status.toUpperCase()}] ${f.area}: ${f.detail}`).join("\n")}

PHASE 4 — CAS-2 CAPACITY & PROFIT RECONCILIATION
Installed=${installed}h  Achievable=${achievable}h  Actual=${actual}h  Idle=${abnormalIdle}h (${idlePct.toFixed(1)}%)  Utilisation=${utilisation.toFixed(1)}%
Reconciled Financial Profit: ${fmtINR(reconciledProfit)}

XBRL PAYLOAD (mock CRA-3 instance):
${xbrl}

--
Draft prepared by My Finance Book — verify with your practising CMA before submission.
`, [company, cin, sector, overall, product, sez, phase1Verdict, fin, cost, diffs, totalDiff, docs, flags, installed, achievable, actual, abnormalIdle, idlePct, utilisation, reconciledProfit, xbrl]);

  const downloadDraft = () => {
    const blob = new Blob([draftReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cost-Audit-Draft-${cin}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Draft report downloaded.");
  };

  // Navigation with strict gating
  const canAdvance = (target) => {
    if (target <= step) return true;
    if (step === 0) return phase1Ok;
    if (step === 1) return phase2Ok;
    if (step === 2) return phase3Ok;
    return true;
  };
  const goTo = (target) => {
    if (canAdvance(target)) setStep(target);
    else toast.error("Complete this phase before moving forward.");
  };

  return (
    <div className="space-y-6" data-testid="cost-audit-page">
      <div>
        <div className="text-xs font-mono-data text-cyan-300 uppercase tracking-widest">Section 4</div>
        <h1 className="font-display text-4xl text-white mt-1 tracking-tight">Cost Audit & CMA Services</h1>
        <p className="text-zinc-500 mt-2 text-sm">Interactive 4-phase workflow — Section 148 of the Companies Act 2013 + Companies (Cost Records and Audit) Rules 2014. Each phase gates the next.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Company Name</Label><Input data-testid="company" value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 bg-zinc-950 border-zinc-800 text-white" /></div>
        <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">CIN</Label><Input data-testid="cin" value={cin} onChange={(e) => setCin(e.target.value)} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
      </div>

      <Stepper steps={STEPS} active={step} onSelect={goTo} />

      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-testid="phase-1">
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div>
              <Label className="text-[10px] uppercase font-mono-data text-zinc-500">Industry Type</Label>
              <select data-testid="sector" value={sector} onChange={(e) => setSector(e.target.value)} className="mt-1 block w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white">
                <option>Regulated</option>
                <option>Non-Regulated</option>
              </select>
              <div className="text-[11px] text-zinc-500 mt-2 leading-relaxed">Regulated = Telecom, Power, Petroleum, Pharma, Fertilizers, Sugar. Non-Regulated = Steel, Cement, Textiles, Auto, Chemicals, Machinery, Tyres.</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InlineField label="Total Annual Turnover" value={overall} onChange={setOverall} tid="overall" unit="₹ Cr" />
              <InlineField label="Individual Product Turnover" value={product} onChange={setProduct} tid="product" unit="₹ Cr" />
            </div>
            <label className="flex items-center gap-3">
              <Switch data-testid="sez" checked={sez} onCheckedChange={setSez} /> <span className="text-sm text-zinc-300">SEZ unit or export &gt; 75% of revenue</span>
            </label>
          </div>
          <div className="space-y-3">
            <div className={`rounded-xl border p-5 ${auditReq ? "border-red-500/30 bg-red-500/[0.05]" : recordsReq ? "border-yellow-500/30 bg-yellow-500/[0.05]" : "border-emerald-500/30 bg-emerald-500/[0.05]"}`} data-testid="verdict">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono-data">Statutory Verdict</div>
              <div className={`font-display text-xl mt-2 ${auditReq ? "text-red-300" : recordsReq ? "text-yellow-300" : "text-emerald-300"}`}>{phase1Verdict}</div>
              <div className="text-xs text-zinc-400 mt-3 leading-relaxed">
                CRA-1 records: {recordsReq ? "Required (Overall ≥ ₹35 Cr)" : "Not required"} · CRA-3 audit: {auditReq ? "Mandatory" : "Not required"}
              </div>
            </div>
            <PhaseGate ok={phase1Ok} message="Enter both turnover figures to unlock the next phase." />
            <Button data-testid="p1-next" disabled={!phase1Ok} onClick={() => goTo(1)} className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 disabled:opacity-50">Phase 2 — Accounts Recon <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4" data-testid="phase-2">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <div className="font-display text-white mb-3">Upload Ledgers <span className="text-xs text-zinc-500">({uploadedCount}/3 uploaded)</span></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <UploadTile label="Trial Balance" file={docs.tb} onChange={(f) => setDocs((d) => ({ ...d, tb: f }))} testid="upload-tb" />
              <UploadTile label="Financial P&L" file={docs.pl} onChange={(f) => setDocs((d) => ({ ...d, pl: f }))} testid="upload-pl" />
              <UploadTile label="Cost Ledger / Sheets" file={docs.cost} onChange={(f) => setDocs((d) => ({ ...d, cost: f }))} testid="upload-cost" />
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <div className="font-display text-white mb-4">Material / Labor / Overhead Comparator</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-widest font-mono-data text-zinc-500">Financial Ledger</div>
                <InlineField label="Material" value={fin.material} onChange={(v) => setFin((s) => ({ ...s, material: v }))} tid="fin-material" />
                <InlineField label="Labor" value={fin.labor} onChange={(v) => setFin((s) => ({ ...s, labor: v }))} tid="fin-labor" />
                <InlineField label="Overhead" value={fin.overhead} onChange={(v) => setFin((s) => ({ ...s, overhead: v }))} tid="fin-overhead" />
              </div>
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-widest font-mono-data text-zinc-500">Cost Ledger</div>
                <InlineField label="Material" value={cost.material} onChange={(v) => setCost((s) => ({ ...s, material: v }))} tid="cost-material" />
                <InlineField label="Labor" value={cost.labor} onChange={(v) => setCost((s) => ({ ...s, labor: v }))} tid="cost-labor" />
                <InlineField label="Overhead" value={cost.overhead} onChange={(v) => setCost((s) => ({ ...s, overhead: v }))} tid="cost-overhead" />
              </div>
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-widest font-mono-data text-zinc-500">Variance</div>
                <VarCell label="Material" v={diffs.material} tid="var-material" />
                <VarCell label="Labor" v={diffs.labor} tid="var-labor" />
                <VarCell label="Overhead" v={diffs.overhead} tid="var-overhead" />
                <div className={`rounded-lg border p-3 mt-2 ${Math.abs(totalDiff) > 0 ? "border-yellow-500/25 bg-yellow-500/5" : "border-emerald-500/25 bg-emerald-500/5"}`} data-testid="total-diff">
                  <div className="text-[10px] uppercase font-mono-data text-zinc-500">Net Un-reconciled</div>
                  <div className={`font-mono-data text-xl mt-1 ${Math.abs(totalDiff) > 0 ? "text-yellow-300" : "text-emerald-300"}`}>{fmtINR(totalDiff)}</div>
                </div>
              </div>
            </div>
          </div>

          <PhaseGate ok={phase2Ok} message={`Upload all 3 ledgers (Trial Balance, P&L, Cost Ledger). Currently ${uploadedCount}/3 uploaded.`} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => goTo(0)} className="border-zinc-700 text-zinc-300"><ArrowLeft className="w-4 h-4 mr-1" /> Phase 1</Button>
            <Button data-testid="p2-next" disabled={!phase2Ok} onClick={() => goTo(2)} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 disabled:opacity-50">Phase 3 — AI Data Review <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4" data-testid="phase-3">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <div className="font-display text-white mb-3">Bulk Upload — Operational Data <span className="text-xs text-zinc-500">({bulkCount}/4 uploaded)</span></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <UploadTile label="Material Vouchers" file={bulk.vouchers} onChange={(f) => setBulk((d) => ({ ...d, vouchers: f }))} testid="bulk-vouchers" />
              <UploadTile label="Employee Cost Breakdown" file={bulk.employee} onChange={(f) => setBulk((d) => ({ ...d, employee: f }))} testid="bulk-employee" />
              <UploadTile label="Utility Invoices" file={bulk.utility} onChange={(f) => setBulk((d) => ({ ...d, utility: f }))} testid="bulk-utility" />
              <UploadTile label="Production Logs" file={bulk.production} onChange={(f) => setBulk((d) => ({ ...d, production: f }))} testid="bulk-production" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button
                data-testid="ai-review-data"
                onClick={runAiReview}
                disabled={reviewing}
                className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 disabled:opacity-60"
              >
                {reviewing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning…</> : <><Sparkles className="w-4 h-4 mr-2" /> AI Review Data</>}
              </Button>
              {flags && <span className="text-xs text-zinc-400 font-mono-data">{flags.filter((f) => f.status === "Requires Manual Review").length} of {flags.length} components need manual review</span>}
            </div>
          </div>

          {flags && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden" data-testid="ai-flags">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 text-zinc-500 text-[11px] uppercase font-mono-data">
                  <tr><th className="text-left px-4 py-3">Component</th><th className="text-left">Finding</th><th className="text-center">Status</th></tr>
                </thead>
                <tbody>
                  {flags.map((f) => (
                    <tr key={f.area} className="border-t border-zinc-800 text-zinc-300">
                      <td className="px-4 py-3 font-display">{f.area}</td>
                      <td className="text-xs leading-relaxed pr-4">{f.detail}</td>
                      <td className="text-center">
                        {f.status === "Accurate"
                          ? <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"><CheckCircle2 className="w-3 h-3 mr-1" /> Accurate</Badge>
                          : <Badge className="bg-yellow-500/15 text-yellow-300 border border-yellow-500/25"><AlertTriangle className="w-3 h-3 mr-1" /> Manual Review</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <PhaseGate ok={phase3Ok} message="Run the AI Review Data scan before proceeding to the audit report." />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => goTo(1)} className="border-zinc-700 text-zinc-300"><ArrowLeft className="w-4 h-4 mr-1" /> Phase 2</Button>
            <Button data-testid="p3-next" disabled={!phase3Ok} onClick={() => goTo(3)} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 disabled:opacity-50">Phase 4 — Report <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="phase-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-display text-white flex items-center gap-2"><FileText className="w-4 h-4 text-cyan-300" /> Draft Audit Report</div>
              <Button data-testid="download-draft" onClick={downloadDraft} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950"><Download className="w-4 h-4 mr-1" /> Download Draft</Button>
            </div>
            <pre data-testid="draft-preview" className="text-[10px] text-emerald-100 font-mono-data whitespace-pre-wrap leading-relaxed max-h-[520px] overflow-auto bg-zinc-950 border border-zinc-800 rounded-lg p-4">{draftReport}</pre>
          </div>
          <div className="space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
              <div className="font-display text-white mb-3">Reconciliation Summary</div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <Stat label="Utilisation" v={utilisation.toFixed(1)} unit="%" tone="cyan" />
                <Stat label="Abnormal Idle" v={idlePct.toFixed(1)} unit="%" tone={idlePct > 10 ? "red" : "emerald"} />
                <Stat label="Net Un-reconciled" v={fmtINR(totalDiff)} tone={Math.abs(totalDiff) > 0 ? "yellow" : "emerald"} />
                <Stat label="AI Manual Flags" v={`${(flags || []).filter((f) => f.status === "Requires Manual Review").length}`} tone={(flags || []).filter((f) => f.status === "Requires Manual Review").length > 0 ? "yellow" : "emerald"} />
              </div>
            </div>
            <AiPanel
              label="AI Compliance Diagnostics"
              buildPrompt={() => `Cost audit review for ${company} (${cin}), ${sector} sector, turnover ${overall}Cr / product ${product}Cr / SEZ=${sez}. Reconciliation variance material=${diffs.material}, labor=${diffs.labor}, overhead=${diffs.overhead}. AI review flags: ${JSON.stringify(flags)}. Abnormal idle capacity ${idlePct.toFixed(1)}%. Give: 3 strategic cost-reduction insights specific to Indian manufacturing, 2 statutory risk warnings around CAS-2/CAS-3/CAS-7, and 2 internal-control fixes before submitting CRA-3.`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function VarCell({ label, v, tid }) {
  const bad = Math.abs(v) > 0;
  return (
    <div data-testid={tid} className={`rounded-lg border p-2.5 ${bad ? "border-yellow-500/25 bg-yellow-500/5" : "border-emerald-500/25 bg-emerald-500/5"}`}>
      <div className="text-[10px] text-zinc-500 uppercase font-mono-data">{label}</div>
      <div className={`font-mono-data text-sm mt-1 ${bad ? "text-yellow-300" : "text-emerald-300"}`}>{fmtINR(v)}</div>
    </div>
  );
}
function Stat({ label, v, unit, tone }) {
  const c = tone === "red" ? "text-red-300" : tone === "yellow" ? "text-yellow-300" : tone === "cyan" ? "text-cyan-300" : "text-emerald-300";
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
      <div className="text-[10px] text-zinc-500 uppercase font-mono-data">{label}</div>
      <div className={`font-mono-data text-xl mt-1 ${c}`}>{v}{unit && <span className="text-xs text-zinc-500 ml-1">{unit}</span>}</div>
    </div>
  );
}
