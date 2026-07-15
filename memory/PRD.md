# My Finance Book — PRD

## Original Problem Statement
Dark fintech single-page app with cinematic landing → JWT-gated login (email allowlist, Royal Enfield RE-One style) → 6-section dashboard:
1. **Income Tax** — multi-year FY 23-24 → 26-27, old vs new regime, refund maximizer, deductions/exemptions/perquisites catalog with per-user applicability.
2. **GST Returns** — supply profile, ITC optimizer with 100% GSTR-2B matching, Section 17(5) blocked-credit detector, phased filing.
3. **Investment & AI Wealth** — 40 stocks, 14 F&O, 18 MFs, 24 alternatives, portfolio + watchlist, AI advisor, SIP calc, comparison, news, lumpsum land/gold/flat advisor, per-holding Buy/Sell/Hold signals.
4. **Cost Audit CRA-3** — 4-phase gated wizard (Statutory Eligibility → Accounts Reconciliation with material/labor/overhead comparator → Cost Variance & AI Review → Downloadable Audit Report + MCA XBRL).
5. **TDS/TCS Ledger** — payment codes 1001-1092, PAN checker → 20%, quarterly Form 140/131 preview.
6. **GST Audit** — 5-phase multi-way reconciliation with DRC-03 directives.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). JWT (pyjwt) + bcrypt. Session in httpOnly + Secure + SameSite=lax cookie (`mfb_session`). `emergentintegrations` LlmChat for Claude Sonnet 4.5 / GPT-5.2.
- **Frontend**: React 19 + React Router 7, TailwindCSS, shadcn/ui, Recharts, framer-motion, sonner. Fonts: Outfit + Manrope + JetBrains Mono.

## What's Been Implemented (Feb 2026)
- v1 (MVP): cinematic landing, JWT+cookie login, all 6 sections functional end-to-end, AI advisor wired to Claude/GPT.
- v1.1 (code-review): httpOnly cookie migration, split useMemos, stable ids, extracted LoginPanel + IndicesTicker, Python type hints.
- v1.2 (feature bundle): **Income Tax** deductions/exemptions/perquisites catalog with one-click "Add"; **Investments** Lumpsum Advisor (land/gold/flat/MF/stocks/FD split with amount-aware verdict) + per-holding Buy/Sell/Hold trade signals + SignalCard on Stocks tab; **Cost Audit** rewritten as strict 4-phase gated wizard (upload gates + AI Review Data + downloadable text draft).

## Test Results
- iteration_1: backend 12/14, frontend 100%.
- iteration_2: backend 17/17, frontend 100%.
- iteration_3: **backend 17/17** (after LLM key rotation), **frontend 100%** on all three feature bundles.
- Deployment agent: **PASS** — no blockers.

## Backlog (v2)
- P1: PDF export of Wealth Advisor + Cost Audit reports (currently .txt).
- P1: Alpha Vantage live prices behind existing seeded fallback.
- P2: Real doc OCR for Form 16 / GSTR-2B / Trial Balance.
- P2: Multi-tenant workspaces for CA firms.
- P2: SSE streaming responses for AI panels.
- P3: Shareable public snapshot URLs (viral acquisition).
