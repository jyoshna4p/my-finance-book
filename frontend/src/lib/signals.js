import { seriesFor, priceFor } from "@/lib/marketData";

/** Compute a naive buy/sell/hold signal for a symbol based on:
 *   - Current vs 30-day mean (momentum)
 *   - Current vs base (over/undervalued heuristic)
 * Returns { signal: "BUY"|"SELL"|"HOLD", score, reason, target, stopLoss }
 */
export function tradeSignal(symbol, base) {
  const series = seriesFor(symbol, base);
  const now = priceFor(symbol, base);
  const mean = series.reduce((a, p) => a + p.price, 0) / series.length;
  const min = Math.min(...series.map((p) => p.price));
  const max = Math.max(...series.map((p) => p.price));

  const vsMean = (now - mean) / mean; // >0 above trend
  const vsBase = (now - base) / base;

  let signal = "HOLD";
  let reason = "Price is trading near its 30-day mean — no strong edge either way.";
  if (vsMean < -0.03 && vsBase < -0.02) {
    signal = "BUY";
    reason = `Trading ${(vsMean * -100).toFixed(1)}% below its 30-day mean and ${(vsBase * -100).toFixed(1)}% below fair value — accumulate on dips.`;
  } else if (vsMean > 0.04 && vsBase > 0.04) {
    signal = "SELL";
    reason = `Trading ${(vsMean * 100).toFixed(1)}% above the 30-day mean and ${(vsBase * 100).toFixed(1)}% above fair value — consider trimming.`;
  } else if (vsMean > 0.02) {
    signal = "HOLD";
    reason = "Momentum positive but not extended — ride the trend, tighten trailing stop.";
  } else if (vsMean < -0.015) {
    signal = "HOLD";
    reason = "Mild weakness — wait for a bounce above the 30-day mean before adding.";
  }

  return {
    signal,
    score: Math.round(vsMean * 100),
    reason,
    target: +(now * (signal === "BUY" ? 1.12 : signal === "SELL" ? 0.94 : 1.06)).toFixed(2),
    stopLoss: +(now * (signal === "BUY" ? 0.94 : signal === "SELL" ? 1.05 : 0.97)).toFixed(2),
    range: { min, max, mean: +mean.toFixed(2) },
  };
}
