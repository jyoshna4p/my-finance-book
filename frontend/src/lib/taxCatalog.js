// Comprehensive catalog of Indian IT deductions, exemptions and salary perquisites
// with applicability heuristics.

// A rule returns true when the item is likely applicable to the given profile.
// { sources: string[], hasEmployer: boolean, ded: object, gross, other, tds }
export const DEDUCTIONS = [
  { code: "80C", title: "Life Insurance, PPF, ELSS, EPF, Home-loan principal", cap: 150000, regime: "old", applies: () => true, hint: "Everyone should claim if they invest in PPF/ELSS/EPF/insurance." },
  { code: "80CCD(1B)", title: "NPS additional contribution", cap: 50000, regime: "old", applies: () => true, hint: "Over-and-above 80C — great if you have NPS Tier-1." },
  { code: "80CCD(2)", title: "Employer NPS contribution", cap: 0, regime: "both", applies: (p) => p.sources.includes("salary"), hint: "Only for salaried — allowed even under New Regime." },
  { code: "80D", title: "Health Insurance Premium (self + parents)", cap: 100000, regime: "old", applies: () => true, hint: "₹25k self + ₹25k dependent + ₹50k senior parents." },
  { code: "80DD", title: "Maintenance of disabled dependent", cap: 125000, regime: "old", applies: () => true, hint: "For disabled dependent (Form 10-IA)." },
  { code: "80DDB", title: "Specified illness treatment", cap: 100000, regime: "old", applies: () => true, hint: "Cancer, kidney failure, etc. — needs specialist certificate." },
  { code: "80E", title: "Education Loan Interest", cap: 0, regime: "old", applies: () => true, hint: "No upper cap — 8-year window." },
  { code: "80EE / 80EEA", title: "First-home-buyer interest", cap: 150000, regime: "old", applies: (p) => p.sources.includes("houseRent") || (p.ded["24b"] || 0) > 0, hint: "Affordable housing (loan < ₹35L / value < ₹45L)." },
  { code: "80G", title: "Donations to notified charities", cap: 0, regime: "old", applies: () => true, hint: "50% or 100% depending on trust class." },
  { code: "80GG", title: "Rent Paid (no HRA)", cap: 60000, regime: "old", applies: (p) => p.sources.includes("houseRent") && (p.ded["HRA"] || 0) === 0, hint: "Only if no HRA in salary." },
  { code: "80TTA", title: "Savings Bank Interest", cap: 10000, regime: "old", applies: (p) => p.sources.includes("savings"), hint: "You're getting savings interest — claim this." },
  { code: "80TTB", title: "Interest for Senior Citizens", cap: 50000, regime: "old", applies: (p) => p.age && p.age >= 60, hint: "Senior citizens replace 80TTA with 80TTB." },
  { code: "80U", title: "Self-Disability Deduction", cap: 125000, regime: "old", applies: () => true, hint: "Only if the assessee themself is disabled (Form 10-IA)." },
  { code: "24(b)", title: "Home Loan Interest — Self-occupied", cap: 200000, regime: "old", applies: (p) => p.sources.includes("houseRent") || p.sources.includes("multipleHouse"), hint: "Deduct on interest paid to housing lender." },
];

export const EXEMPTIONS = [
  { code: "HRA", title: "House Rent Allowance", regime: "old", applies: (p) => p.sources.includes("salary"), hint: "Min of (actual HRA, 50/40% of basic, Rent − 10% basic)." },
  { code: "LTA", title: "Leave Travel Allowance", regime: "old", applies: (p) => p.sources.includes("salary"), hint: "Twice in a block of 4 years — India only." },
  { code: "Gratuity 10(10)", title: "Gratuity on retirement", regime: "both", applies: (p) => p.sources.includes("salary"), hint: "Up to ₹20 Lakh lifetime exempt for private employees." },
  { code: "Leave Encashment 10(10AA)", title: "Leave Encashment", regime: "both", applies: (p) => p.sources.includes("salary"), hint: "Non-govt: cap ₹25L (Budget 2023 update)." },
  { code: "EPF withdrawal", title: "EPF withdrawal after 5 yrs", regime: "both", applies: (p) => p.sources.includes("salary"), hint: "Fully exempt if continuous service ≥ 5 yrs." },
  { code: "Agri 10(1)", title: "Agricultural Income", regime: "both", applies: (p) => p.sources.includes("agriculture"), hint: "Exempt but aggregated for slab-rate calc if > ₹5,000." },
  { code: "PPF interest", title: "PPF Interest + Maturity", regime: "both", applies: () => true, hint: "EEE — completely tax-free." },
  { code: "Dividend 10(35)", title: "MF Dividend up to ₹5,000", regime: "both", applies: (p) => p.sources.includes("capitalGains"), hint: "TDS at 10% above ₹5k threshold." },
];

export const PERQUISITES = [
  { code: "RFA", title: "Rent-Free Accommodation", applies: (p) => p.sources.includes("salary"), taxable: "As % of salary depending on city population" },
  { code: "Company Car", title: "Company-provided Car", applies: (p) => p.sources.includes("salary"), taxable: "₹1,800/mo (small) or ₹2,400/mo (large) + ₹900/mo driver" },
  { code: "ESOPs", title: "Employee Stock Options", applies: (p) => p.sources.includes("salary"), taxable: "FMV − exercise price at vesting; capital gains at sale" },
  { code: "Interest-free Loan", title: "Interest-free / concessional loan", applies: (p) => p.sources.includes("salary"), taxable: "SBI benchmark rate applied; small loans < ₹20k exempt" },
  { code: "Meal Coupons", title: "Meal Coupons (Sodexo / Zaggle)", applies: (p) => p.sources.includes("salary"), taxable: "₹50 per meal exempt — rest taxable" },
  { code: "Medical Reimbursement", title: "Group medical insurance premium", applies: (p) => p.sources.includes("salary"), taxable: "Fully exempt if employer pays directly" },
  { code: "Gift Vouchers", title: "Gifts / Vouchers from employer", applies: (p) => p.sources.includes("salary"), taxable: "Exempt up to ₹5,000 aggregate p.a." },
  { code: "Free Education", title: "Free education for children", applies: (p) => p.sources.includes("salary"), taxable: "Cost > ₹1,000/mo/child taxable" },
];
