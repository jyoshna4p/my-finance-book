import { DEDUCTIONS, EXEMPTIONS, PERQUISITES } from "@/lib/taxCatalog";
import { fmtINR, DEDUCTION_CAPS } from "@/lib/taxConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, CheckCircle2, Lock } from "lucide-react";

/**
 * Personalised deductions/exemptions/perquisites catalog with applicability hints.
 * `profile` contains: sources[], ded{}, gross, other, age?, regime.
 * `onAdd({code, suggestedValue})` is fired when the user clicks "Add"; the parent
 * (IncomeTax) wires it into its `ded` state.
 */
export default function DeductionsCatalog({ profile, onAdd }) {
  const isClaimed = (code) => Number(profile.ded?.[code] || 0) > 0;
  const suggested = (code) => {
    const cap = DEDUCTION_CAPS[code];
    if (cap && cap !== Infinity) return cap;
    return 25000; // default nudge
  };

  return (
    <div className="space-y-4" data-testid="deductions-catalog">
      <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/[0.04] p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <div className="font-display text-white">Personalised Optimizer</div>
        </div>
        <div className="text-xs text-zinc-400">Based on your income sources and regime, here is every deduction / exemption / salary perquisite you could still claim.</div>
      </div>

      <Section
        title="Deductions (Chapter VI-A)"
        tid="ded-catalog-list"
        items={DEDUCTIONS}
        profile={profile}
        renderStatus={(d) => {
          const applies = d.applies(profile);
          const regimeBlocked = d.regime === "old" && profile.regime === "new" && d.code !== "80CCD(2)";
          const claimed = isClaimed(d.code);
          return { applies, regimeBlocked, claimed, valueHint: d.cap ? `up to ${fmtINR(d.cap)}` : "no cap" };
        }}
        onAdd={(d) => onAdd && onAdd({ code: d.code, suggestedValue: suggested(d.code) })}
      />

      <Section
        title="Exemptions (Section 10 & others)"
        tid="exemption-catalog-list"
        items={EXEMPTIONS}
        profile={profile}
        renderStatus={(e) => {
          const applies = e.applies(profile);
          const regimeBlocked = e.regime === "old" && profile.regime === "new";
          return { applies, regimeBlocked, claimed: false, valueHint: e.hint };
        }}
      />

      <Section
        title="Salary Perquisites (Section 17(2))"
        tid="perquisite-catalog-list"
        items={PERQUISITES}
        profile={profile}
        renderStatus={(p) => {
          const applies = p.applies(profile);
          return { applies, regimeBlocked: false, claimed: false, valueHint: p.taxable };
        }}
      />
    </div>
  );
}

function Section({ title, items, profile, renderStatus, onAdd, tid }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden" data-testid={tid}>
      <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="font-display text-white text-sm">{title}</div>
        <div className="text-[10px] text-zinc-500 font-mono-data">{items.filter((it) => renderStatus(it).applies).length} of {items.length} may apply</div>
      </div>
      <div className="divide-y divide-zinc-800/70">
        {items.map((it) => {
          const s = renderStatus(it);
          const tone = s.regimeBlocked ? "muted" : s.claimed ? "claimed" : s.applies ? "actionable" : "muted";
          return (
            <div key={it.code} className={`flex items-center gap-3 px-5 py-3 ${tone === "actionable" ? "hover:bg-zinc-800/40 transition-colors" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono-data text-cyan-300 text-xs">{it.code}</span>
                  <span className="text-sm text-white truncate">{it.title}</span>
                  {tone === "claimed" && <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[10px]">Already claimed</Badge>}
                  {tone === "actionable" && !s.claimed && <Badge className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[10px]">Recommended</Badge>}
                  {s.regimeBlocked && <Badge className="bg-zinc-800 text-zinc-500 text-[10px]"><Lock className="w-2.5 h-2.5 mr-1" />New Regime blocks</Badge>}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{it.hint || s.valueHint}{it.cap ? ` · cap ${fmtINR(it.cap)}` : ""}</div>
              </div>
              {onAdd && tone === "actionable" && !s.claimed && (
                <Button size="sm" data-testid={`add-${it.code}`} onClick={() => onAdd(it)} className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 h-8 shrink-0">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              )}
              {tone === "claimed" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
