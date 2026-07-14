import { INDICES, priceFor } from "@/lib/marketData";

export default function IndicesTicker() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden" data-testid="indices-ticker">
      <div className="flex overflow-hidden">
        <div className="mfb-ticker flex gap-6 py-3 px-4 whitespace-nowrap">
          {[...INDICES, ...INDICES].map((i, k) => {
            const p = priceFor(i.s, i.base);
            const chg = ((p - i.base) / i.base) * 100;
            return (
              <span key={`${i.s}-${k}`} className="flex items-center gap-2 text-sm">
                <span className="text-zinc-400 font-display">{i.s}</span>
                <span className="font-mono-data text-white">{i.base > 1000 ? p.toFixed(0) : p.toFixed(2)}</span>
                <span className={`font-mono-data text-xs ${chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)}%</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
