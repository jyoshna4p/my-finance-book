// Centralized multi-year tax config for Indian Income Tax.
// New Regime is default from FY 2023-24 onward. Old Regime kept as toggle where allowed.

export const TAX_YEARS = [
  { fy: "2023-24", ay: "2024-25" },
  { fy: "2024-25", ay: "2025-26" },
  { fy: "2025-26", ay: "2026-27" },
  { fy: "2026-27", ay: "2027-28" },
];

// Slabs given as [upTo, rate]. upTo=Infinity for last slab.
export const taxConfig = {
  "2023-24": {
    new: {
      slabs: [[300000, 0], [600000, 0.05], [900000, 0.10], [1200000, 0.15], [1500000, 0.20], [Infinity, 0.30]],
      standardDeduction: 50000,
      rebate87A: { limit: 700000, cap: 25000 },
      allowedDeductions: [],
    },
    old: {
      slabs: [[250000, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]],
      standardDeduction: 50000,
      rebate87A: { limit: 500000, cap: 12500 },
      allowedDeductions: ["80C", "80D", "80G", "80TTA", "24b", "HRA"],
    },
  },
  "2024-25": {
    new: {
      slabs: [[300000, 0], [700000, 0.05], [1000000, 0.10], [1200000, 0.15], [1500000, 0.20], [Infinity, 0.30]],
      standardDeduction: 75000,
      rebate87A: { limit: 700000, cap: 25000 },
      allowedDeductions: [],
    },
    old: {
      slabs: [[250000, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]],
      standardDeduction: 50000,
      rebate87A: { limit: 500000, cap: 12500 },
      allowedDeductions: ["80C", "80D", "80G", "80TTA", "24b", "HRA"],
    },
  },
  "2025-26": {
    new: {
      slabs: [[400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15], [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30]],
      standardDeduction: 75000,
      rebate87A: { limit: 1200000, cap: 60000 },
      allowedDeductions: [],
    },
    old: {
      slabs: [[250000, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]],
      standardDeduction: 50000,
      rebate87A: { limit: 500000, cap: 12500 },
      allowedDeductions: ["80C", "80D", "80G", "80TTA", "24b", "HRA"],
    },
  },
  "2026-27": {
    new: {
      slabs: [[400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15], [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30]],
      standardDeduction: 75000,
      rebate87A: { limit: 1200000, cap: 60000 },
      allowedDeductions: [],
    },
    old: {
      slabs: [[250000, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]],
      standardDeduction: 50000,
      rebate87A: { limit: 500000, cap: 12500 },
      allowedDeductions: ["80C", "80D", "80G", "80TTA", "24b", "HRA"],
    },
  },
};

export const DEDUCTION_CAPS = {
  "80C": 150000,
  "80D": 25000,
  "80G": Infinity,
  "80TTA": 10000,
  "24b": 200000,
  HRA: Infinity,
};

export function computeTax({ gross, regime, year, deductions, tdsPaid }) {
  const cfg = taxConfig[year]?.[regime];
  if (!cfg) return null;
  const sd = cfg.standardDeduction || 0;
  let ded = 0;
  if (regime === "old") {
    for (const [k, v] of Object.entries(deductions || {})) {
      const cap = DEDUCTION_CAPS[k] ?? 0;
      ded += Math.min(Number(v || 0), cap);
    }
  }
  const taxable = Math.max(0, gross - sd - ded);
  let tax = 0;
  let last = 0;
  for (const [upTo, rate] of cfg.slabs) {
    if (taxable > last) {
      const slice = Math.min(taxable, upTo) - last;
      if (slice > 0) tax += slice * rate;
      last = upTo;
    }
  }
  // 87A rebate
  if (taxable <= cfg.rebate87A.limit) tax = Math.max(0, tax - cfg.rebate87A.cap);
  const cess = tax * 0.04;
  const total = tax + cess;
  const net = total - Number(tdsPaid || 0);
  return {
    taxable,
    tax: Math.round(tax),
    cess: Math.round(cess),
    total: Math.round(total),
    net: Math.round(net),
    refund: net < 0 ? Math.round(-net) : 0,
    due: net > 0 ? Math.round(net) : 0,
  };
}

export const fmtINR = (n) =>
  "₹" + Math.round(Number(n || 0)).toLocaleString("en-IN");

export function suggestITR(sources) {
  const has = (k) => sources.includes(k);
  if (has("business") || has("freelance") || has("crypto") && has("business")) return { form: "ITR-3", why: "You have Business / Professional income requiring detailed P&L reporting." };
  if (has("presumptive")) return { form: "ITR-4", why: "You opted for Presumptive Taxation (Sec 44AD/44ADA/44AE)." };
  if (has("capitalGains") || has("multipleHouse") || has("crypto") || has("foreign")) return { form: "ITR-2", why: "You have Capital Gains / Crypto (VDA) / more than one house / foreign income." };
  if (has("agriculture") && sources.length > 1) return { form: "ITR-2", why: "Agricultural income above ₹5,000 combined with other income requires ITR-2." };
  return { form: "ITR-1 (Sahaj)", why: "Salary / one house property / interest income within ₹50 Lakh." };
}
