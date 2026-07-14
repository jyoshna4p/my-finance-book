# My Finance Book — PRD

## Original Problem Statement
Build "My Finance Book" — a dark fintech single-page app with a cinematic landing (auto-playing intro presenting the value proposition → JWT-gated login with a pre-approved email allowlist, Royal Enfield RE-One style) → dashboard with 6 sections:

1. Income Tax Portal (multi-year FY 2023-24 → 2026-27, old vs new regime, refund maximizer, filing guide, AI review)
2. GST Returns (supply profile, ITC optimizer with 100% GSTR-2B matching, Section 17(5) blocked-credit detector, GSTR-1/2B/3B filing guide)
3. Investment & AI Wealth (40 stocks, 14 F&O, 18 MFs, 24 alternatives, portfolio + watchlist, AI advisor, SIP calc, comparison, news)
4. Cost Audit CRA-3 (eligibility, 3-way GST recon, CAS-2 capacity, MCA XBRL, AI diagnostics)
5. TDS/TCS Ledger (payment codes 1001-1092, PAN checker → 20%, quarterly Form 140/131 preview)
6. GST Audit multi-way reconciliation (Books ↔ GSTR-1/3B/2B ↔ Purchase Register → DRC-03 directives)

## Architecture
- **Backend**: FastAPI + MongoDB (motor). JWT (pyjwt) + bcrypt. `emergentintegrations` LlmChat for Claude Sonnet 4.5 / GPT-5.2.
- **Frontend**: React 19 + React Router 7, TailwindCSS, shadcn/ui, Recharts, framer-motion, sonner. Fonts: Outfit + Manrope + JetBrains Mono.
- **Auth**: `/api/auth/login` verifies email against `ALLOWED_EMAILS` env, then bcrypt. Returns 7-day JWT (12h if "remember" off). Frontend guards `/app/*` routes via `Protected` wrapper.

## Personas
- CA / CFO managing multiple statutory filings for SMEs.
- Finance-savvy individual tracking Income Tax, portfolio & TDS in one place.

## What's Been Implemented (Feb 2026)
- ✅ Cinematic landing (CSS motion graphics, value-prop grid, Skip Intro button, 8s auto-transition).
- ✅ JWT login with email allowlist + bcrypt + seeded demo users.
- ✅ Sidebar shell with 6 nav sections + logout.
- ✅ Section 1 — Income Tax: 4-step wizard (income profile → docs+regime compare → filing guide → AI review), multi-year config for FY 23-24 → 26-27, deduction caps, 87A rebate, cess, refund maximiser.
- ✅ Section 2 — GST: supply profile → forms; slab-wise output GST; ITC vs GSTR-2B matching with excess claim warning (Rule 36(4)); Section 17(5) blocked credit detector; 180-day rule; 3-phase filing guide.
- ✅ Section 3 — Investments: indices ticker, 40 stocks with 30-day area charts, 14 F&O contracts table, 18 MFs, 24 alternatives, portfolio CRUD with P&L + watchlist (persisted to Mongo), goal planner + AI Wealth Advisor, SIP calc, stock comparison, news feed.
- ✅ Section 4 — Cost Audit: eligibility engine (Sec 148 CRA-1/CRA-3 thresholds), 3-way variance (Books ↔ GSTR ↔ CRA-3), CAS-2 capacity modelling + abnormal-idle flag, cost-financial profit reconciliation, mock MCA XBRL generator with `<in-cca:*>` tags.
- ✅ Section 5 — TDS/TCS: 11 payment codes 1001-1092, PAN validity checker + 20% default override, per-row threshold status, Form 140 preview.
- ✅ Section 6 — GST Audit: 5-phase multi-way reconciliation (control totals, variances, 17(5) blocked, Rule 42/43 reversal, 180-day + Sec 50 interest, DRC-03 draft split).
- ✅ AI panels wired to Claude Sonnet 4.5 / GPT-5.2 via emergentintegrations.
- ✅ Testing agent: 100% frontend flows, 12/14 backend (AI blocked only by LLM key budget).

## Known Issues
- ⚠️ **AI endpoints require budget on the Emergent LLM Key** — currently `Max budget: 0.0`. Once topped up (Profile → Universal Key → Add Balance), Claude & GPT panels work immediately without code change.

## Prioritised Backlog
- **P1**: PDF export of Wealth Advisor report (deferred from v1).
- **P1**: Alpha Vantage live-price integration behind existing seeded fallback.
- **P2**: Real doc upload + OCR extraction for Form 16 / GSTR-2B.
- **P2**: Multi-tenant workspaces (CA firm managing multiple clients).
- **P2**: Advanced streaming responses for AI panels (SSE).
- **P3**: Signed URL for XBRL download; direct MCA submission API.
