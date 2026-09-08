# Pivot — Adaptive Habit Tracking

Zero-guilt, tiered habit tracking for founders and high-stress professionals. See [`CLAUDE.md`](./CLAUDE.md) for build scope and conventions, and `Pivot_PRD.docx` for the full product spec.

## v1.0 core loop (implemented)

- **Dynamic Tiered Tracking** — every habit has a Tier 1 (non-negotiable), Tier 2 (target), and Tier 3 (stretch). Logging any tier completes the day.
- **"Never Miss Twice" consistency engine** — a weighted score (`lib/consistency.ts`) that never resets to a bare 0-day streak. One missed day triggers a Tier 1 recovery prompt; two consecutive missed days decay the score gradually.
- **Evening Shutdown** — a persistent end-of-day banner (default 5:30 PM) for one-tap logging of any habit not yet completed.

Calendar Sync and Analytics are shown as locked "Pro" previews only — no live OAuth/Stripe integration yet, per the PRD's own Phase 2 roadmap.

## Setup

1. Install dependencies: `npm install`
2. Create a free project at [supabase.com](https://supabase.com), then run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL editor.
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL and anon key (Project Settings → API).
4. `npm run dev` — open [http://localhost:3000](http://localhost:3000).

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — lint
- `npm test` — Vitest suite (see `lib/consistency.test.ts` for the scoring engine)

## Deployment

Auto-deploys to Vercel on push to `main`, with preview deploys on PRs. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project's Environment Variables panel.
