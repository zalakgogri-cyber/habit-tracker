# Pivot — Adaptive Habit Tracking

Zero-guilt, tiered habit tracking for founders and high-stress professionals. See [`CLAUDE.md`](./CLAUDE.md) for build scope and conventions, and `Pivot_PRD.docx` for the full product spec.

## v1.0 core loop (implemented)

- **Dynamic Tiered Tracking** — every habit has a Tier 1 (non-negotiable), Tier 2 (target), and Tier 3 (stretch). Logging any tier completes the day.
- **"Never Miss Twice" consistency engine** — a weighted score (`lib/consistency.ts`) that never resets to a bare 0-day streak. One missed day triggers a Tier 1 recovery prompt; two consecutive missed days decay the score gradually.
- **Evening Shutdown** — a persistent end-of-day banner (default 5:30 PM) for one-tap logging of any habit not yet completed.

Calendar Sync and Analytics are shown as locked "Pro" previews only — no live OAuth/Stripe integration yet, per the PRD's own Phase 2 roadmap.

## Setup

1. Install dependencies: `npm install`
2. `npm run dev` — open [http://localhost:3000](http://localhost:3000).

This is a **local-only demo build**: there's no backend, no login, and no env vars to configure. Habits and logs persist in the visitor's browser via `localStorage` (see `lib/storage.ts`), seeded with a couple of sample habits on first load. Data doesn't sync across devices and resets if the browser clears site data — a "Reset demo" button on the dashboard also clears it on demand.

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — lint
- `npm test` — Vitest suite (see `lib/consistency.test.ts` for the scoring engine)

## Deployment

Auto-deploys to Vercel on push to `main`, with preview deploys on PRs. No environment variables or external services are required.
