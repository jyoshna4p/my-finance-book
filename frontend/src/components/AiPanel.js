import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiSuggest } from "@/lib/api";
import { toast } from "sonner";

export default function AiPanel({ label = "Ask AI (Claude / GPT)", buildPrompt, system, provider = "anthropic" }) {
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [prov, setProv] = useState(provider);

  const run = async () => {
    setBusy(true);
    setText("");
    try {
      const p = typeof buildPrompt === "function" ? buildPrompt() : String(buildPrompt || "");
      const r = await aiSuggest(p, prov, system);
      setText(r.text || "(no response)");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "AI call failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/[0.04] to-blue-500/[0.02] p-5" data-testid="ai-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <div className="font-display text-sm text-white">{label}</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select
            value={prov}
            data-testid="ai-provider"
            onChange={(e) => setProv(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="anthropic">Claude Sonnet 4.5</option>
            <option value="openai">GPT-5.2</option>
          </select>
          <Button size="sm" data-testid="ai-run-btn" onClick={run} disabled={busy} className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 h-8">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Run AI"}
          </Button>
        </div>
      </div>
      {text && (
        <div data-testid="ai-response" className="mt-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-auto font-manrope">
          {text}
        </div>
      )}
      {!text && !busy && <div className="mt-3 text-xs text-zinc-500">Click "Run AI" for a personalised suggestion based on the numbers you've entered above.</div>}
    </div>
  );
}
