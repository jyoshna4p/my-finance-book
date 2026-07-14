import { useMemo, useState } from "react";
import Stepper from "@/components/Stepper";
import AiPanel from "@/components/AiPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtINR } from "@/lib/taxConfig";
import { ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, FileText } from "lucide-react";

const STEPS = ["Eligibility", "3-Way Recon", "CAS-2 Capacity", "XBRL & AI"];

export default function CostAudit() {
  const [step, setStep] = useState(0);
  const [sector, setSector] = useState("Non-Regulated");
  const [overall, setOverall] = useState(120);
  const [product, setProduct] = useState(40);
  const [sez, setSez] = useState(false);
  const [cin, setCin] = useState("U74999MH2018PTC012345");

  const recordsReq = overall >= 35 && !sez;
  const auditReq = sez ? false : sector === "Regulated" ? (overall >= 50 && product >= 25) : (overall >= 100 && product >= 35);

  const [pl, setPl] = useState(1250000000);
  const [gstr, setGstr] = useState(1245000000);
  const [cra, setCra] = useState(1247500000);
  const varAB = pl - gstr, varAC = pl - cra, varBC = gstr - cra;

  const [installed, setInstalled] = useState(87600);
  const [planned, setPlanned] = useState(4380);
  const [actual, setActual] = useState(72500);
  const achievable = installed - planned;
  const abnormalIdle = Math.max(0, achievable - actual);
  const utilisation = actual / installed * 100;
  const idlePct = abnormalIdle / installed * 100;

  const [profitCost, setProfitCost] = useState(15200000);
  const [incNotCA, setIncNotCA] = useState(120000);
  const [expNotCA, setExpNotCA] = useState(340000);
  const reconciledProfit = profitCost + incNotCA - expNotCA;

  const xbrl = useMemo(() => (
`<?xml version="1.0" encoding="UTF-8"?>
<xbrl xmlns="http://www.xbrl.org/2003/instance"
      xmlns:in-cca="http://www.mca.gov.in/xbrl/cost-audit/2020">
  <in-cca:CorporateIdentityNumber>${cin}</in-cca:CorporateIdentityNumber>
  <in-cca:SectorClassification>${sector}</in-cca:SectorClassification>
  <in-cca:ProductServiceDetailsTable>
    <in-cca:AggregateTurnover>${(product * 10000000).toLocaleString("en-IN")}</in-cca:AggregateTurnover>
  </in-cca:ProductServiceDetailsTable>
  <in-cca:QuantitativeInformationProduction>
    <in-cca:InstalledCapacityHours>${installed}</in-cca:InstalledCapacityHours>
    <in-cca:AchievableCapacityHours>${achievable}</in-cca:AchievableCapacityHours>
    <in-cca:ActualProductionHours>${actual}</in-cca:ActualProductionHours>
    <in-cca:AbnormalIdleCapacityHours>${abnormalIdle}</in-cca:AbnormalIdleCapacityHours>
  </in-cca:QuantitativeInformationProduction>
  <in-cca:CostReconciliationStatementTable>
    <in-cca:ProfitAsPerCostRecords>${profitCost.toLocaleString("en-IN")}</in-cca:ProfitAsPerCostRecords>
    <in-cca:IncomeNotConsideredInCost>${incNotCA.toLocaleString("en-IN")}</in-cca:IncomeNotConsideredInCost>
    <in-cca:ExpenseNotConsideredInCost>${expNotCA.toLocaleString("en-IN")}</in-cca:ExpenseNotConsideredInCost>
    <in-cca:ReconciledFinancialProfit>${reconciledProfit.toLocaleString("en-IN")}</in-cca:ReconciledFinancialProfit>
  </in-cca:CostReconciliationStatementTable>
</xbrl>`
  ), [cin, sector, product, installed, achievable, actual, abnormalIdle, profitCost, incNotCA, expNotCA, reconciledProfit]);

  return (
    <div className="space-y-6" data-testid="cost-audit-page">
      <div>
        <div className="text-xs font-mono-data text-cyan-300 uppercase tracking-widest">Section 4</div>
        <h1 className="font-display text-4xl text-white mt-1 tracking-tight">Cost Audit & CMA Services</h1>
        <p className="text-zinc-500 mt-2 text-sm">Companies Act Section 148 · CAS-2 capacity · 3-way Books↔GSTR↔CRA reconciliation · MCA XBRL generator.</p>
      </div>
      <Stepper steps={STEPS} active={step} onSelect={setStep} />

      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div>
              <Label className="text-[10px] uppercase font-mono-data text-zinc-500">Sector Classification</Label>
              <select data-testid="sector" value={sector} onChange={(e) => setSector(e.target.value)} className="mt-1 block bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white">
                <option>Regulated</option><option>Non-Regulated</option>
              </select>
              <div className="text-[11px] text-zinc-500 mt-2">Regulated = Telecom/Power/Petroleum/Pharma/Fertilizers/Sugar. Non-Regulated = Steel/Cement/Textiles/Auto/Chemicals/etc.</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Overall Turnover (₹ Cr)</Label><Input data-testid="overall" type="number" value={overall} onChange={(e) => setOverall(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Product/Service Turnover (₹ Cr)</Label><Input data-testid="product" type="number" value={product} onChange={(e) => setProduct(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
            </div>
            <label className="flex items-center gap-3">
              <Switch data-testid="sez" checked={sez} onCheckedChange={setSez} /> <span className="text-sm text-zinc-300">SEZ unit or export &gt; 75%</span>
            </label>
          </div>
          <div className="space-y-3">
            <StatusBadge ok={recordsReq} testid="badge-records" label="CRA-1 Cost Records Maintenance" required={recordsReq} note={sez ? "Exempt — SEZ / 75% export" : recordsReq ? "Mandatory (Overall ≥ ₹35 Cr)" : "Not required"} />
            <StatusBadge ok={auditReq} testid="badge-audit" label="CRA-3 Statutory Cost Audit" required={auditReq} note={sez ? "Exempt" : auditReq ? "Mandatory" : "Below threshold"} />
            <Button data-testid="ca-next-1" onClick={() => setStep(1)} className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950">3-Way Reconciliation <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="text-sm text-zinc-400">Enter revenue as recognised by each ledger for the year:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Books P&L Revenue</Label><Input data-testid="rec-pl" type="number" value={pl} onChange={(e) => setPl(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">GSTR-1/3B Taxable Value</Label><Input data-testid="rec-gstr" type="number" value={gstr} onChange={(e) => setGstr(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">CRA-3 Cost Records Sales</Label><Input data-testid="rec-cra" type="number" value={cra} onChange={(e) => setCra(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <VarCell label="P&L vs GSTR" v={varAB} />
              <VarCell label="P&L vs CRA-3" v={varAC} />
              <VarCell label="GSTR vs CRA-3" v={varBC} />
            </div>
          </div>
          <div className="space-y-3">
            {(varAB || varAC || varBC) ? (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
                <div className="flex items-center gap-2 text-yellow-300 mb-2"><AlertTriangle className="w-4 h-4" /><span className="font-display text-sm">Variance Detected</span></div>
                <ul className="text-xs text-zinc-300 space-y-1.5">
                  <li>· Check captive consumption under GST Rule 28/30 (deemed value).</li>
                  <li>· Verify scrap sales / by-product revenue posted only in one ledger.</li>
                  <li>· Reconcile trade discounts / credit notes across all three.</li>
                </ul>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-emerald-300 text-sm flex gap-2"><CheckCircle2 className="w-4 h-4" /> All three ledgers balanced.</div>
            )}
            <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(0)} className="border-zinc-700 text-zinc-300"><ArrowLeft className="w-4 h-4 mr-1" /></Button><Button data-testid="ca-next-2" onClick={() => setStep(2)} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950">Next <ArrowRight className="w-4 h-4 ml-1" /></Button></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="font-display text-white">CAS-2 Capacity Modelling</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Installed Capacity (hrs)</Label><Input data-testid="cap-installed" type="number" value={installed} onChange={(e) => setInstalled(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Planned Interruptions</Label><Input data-testid="cap-planned" type="number" value={planned} onChange={(e) => setPlanned(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Actual Production</Label><Input data-testid="cap-actual" type="number" value={actual} onChange={(e) => setActual(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCell label="Achievable" v={achievable} unit="hrs" />
              <StatCell label="Abnormal Idle" v={abnormalIdle} unit="hrs" tone="red" />
              <StatCell label="Utilisation" v={utilisation.toFixed(1)} unit="%" tone="cyan" />
            </div>
            <div className="font-display text-white pt-4">Profit Reconciliation</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Profit as per Cost Records</Label><Input data-testid="prof-cost" type="number" value={profitCost} onChange={(e) => setProfitCost(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Income NOT in Cost A/C</Label><Input data-testid="inc-not" type="number" value={incNotCA} onChange={(e) => setIncNotCA(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500">Expense NOT in Cost A/C</Label><Input data-testid="exp-not" type="number" value={expNotCA} onChange={(e) => setExpNotCA(Number(e.target.value))} className="mt-1 bg-zinc-950 border-zinc-800 text-white font-mono-data" /></div>
            </div>
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4 flex items-center justify-between">
              <div className="text-xs text-zinc-400">Reconciled Financial Profit</div>
              <div className="font-mono-data text-2xl text-cyan-300">{fmtINR(reconciledProfit)}</div>
            </div>
          </div>
          <div className="space-y-3">
            {idlePct > 10 && <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/5 p-4 text-xs text-yellow-200 leading-relaxed"><b>Insight:</b> Abnormal idle capacity is {idlePct.toFixed(1)}% — strip these fixed overheads from unit cost per CAS-2 §5.7 and route directly to P&L as an unabsorbed variance.</div>}
            <Button data-testid="ca-next-3" onClick={() => setStep(3)} className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950">Generate XBRL <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-display text-white flex items-center gap-2"><FileText className="w-4 h-4 text-cyan-300" /> MCA XBRL Instance (mock)</div>
              <div><Label className="text-[10px] uppercase font-mono-data text-zinc-500 mr-2">CIN</Label>
                <Input data-testid="cin" value={cin} onChange={(e) => setCin(e.target.value)} className="inline-block w-56 h-8 bg-zinc-950 border-zinc-800 text-white font-mono-data text-xs" /></div>
            </div>
            <pre data-testid="xbrl-out" className="text-[10px] text-cyan-100 font-mono-data whitespace-pre-wrap leading-relaxed max-h-[440px] overflow-auto bg-zinc-950 border border-zinc-800 rounded-lg p-4">{xbrl}</pre>
          </div>
          <AiPanel
            label="AI Compliance Diagnostics"
            buildPrompt={() => `Sector ${sector}, overall turnover ${overall}Cr, product ${product}Cr, SEZ=${sez}. Abnormal idle capacity ${abnormalIdle} hrs (${idlePct.toFixed(1)}%). Variances: P&L-GSTR ${varAB}, P&L-CRA ${varAC}, GSTR-CRA ${varBC}. Reconciled profit ${reconciledProfit}. Give: (1) 3 strategic cost-reduction insights specific to Indian manufacturing, (2) 2 risk warnings around CAS-16/CAS-3 gaps, (3) internal-control steps before year-end close.`}
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ ok, required, label, note, testid }) {
  const cls = required ? "border-red-500/30 bg-red-500/[0.05]" : "border-emerald-500/25 bg-emerald-500/[0.05]";
  const c = required ? "text-red-300" : "text-emerald-300";
  return (
    <div data-testid={testid} className={`rounded-xl border ${cls} p-4`}>
      <div className="flex items-center justify-between"><div className="text-xs text-zinc-400">{label}</div><Badge className={`bg-transparent border ${required ? "border-red-500/40 text-red-300" : "border-emerald-500/40 text-emerald-300"}`}>{required ? "Mandatory" : "Not required"}</Badge></div>
      <div className={`text-xs mt-2 ${c}`}>{note}</div>
    </div>
  );
}
function VarCell({ label, v }) {
  const bad = Math.abs(v) > 0;
  return (
    <div className={`rounded-lg border p-3 ${bad ? "border-yellow-500/25 bg-yellow-500/5" : "border-emerald-500/25 bg-emerald-500/5"}`}>
      <div className="text-[10px] text-zinc-500 uppercase font-mono-data">{label}</div>
      <div className={`font-mono-data text-xl mt-1 ${bad ? "text-yellow-300" : "text-emerald-300"}`}>{fmtINR(v)}</div>
    </div>
  );
}
function StatCell({ label, v, unit, tone }) {
  const c = tone === "red" ? "text-red-300" : tone === "cyan" ? "text-cyan-300" : "text-white";
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
      <div className="text-[10px] text-zinc-500 uppercase font-mono-data">{label}</div>
      <div className={`font-mono-data text-2xl mt-1 ${c}`}>{v}<span className="text-xs text-zinc-500 ml-1">{unit}</span></div>
    </div>
  );
}
