import { CheckCircle2 } from "lucide-react";

export default function Stepper({ steps, active, onSelect }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 mb-8 overflow-x-auto pb-2" data-testid="stepper">
      {steps.map((s, i) => {
        const done = i < active;
        const cur = i === active;
        return (
          <button
            key={i}
            data-testid={`step-${i}`}
            onClick={() => onSelect && onSelect(i)}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-lg border transition-colors duration-200 whitespace-nowrap ${
              cur
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                : done
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono-data ${done ? "bg-emerald-500/25" : cur ? "bg-cyan-500/25" : "bg-zinc-800"}`}>
              {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </span>
            <span className="font-display text-xs sm:text-sm">{s}</span>
            {i < steps.length - 1 && <span className={`hidden sm:block w-6 h-px ml-2 ${done ? "bg-emerald-500/40" : "bg-zinc-800"}`} />}
          </button>
        );
      })}
    </div>
  );
}
