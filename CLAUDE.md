@AGENTS.md

# Pivot — Habit Tracker

Adaptive, zero-guilt habit tracking for founders and high-stress professionals. Full spec: `Pivot_PRD.docx` in the repo root — read it before starting any feature work.

## What we're building (v1.0 scope)

A web app (Next.js) implementing the core loop from the PRD. Native iOS/Android are out of scope for this repo for now — this is the web dashboard track, deployed on Vercel.

**Build in this order:**
1. Dynamic Tiered Tracking (Tier 1 / Tier 2 / Tier 3 per habit)
2. "Never Miss Twice" weighted consistency engine
3. Evening Shutdown widget equivalent (web: a persistent end-of-day prompt/notification)
4. Smart Calendar Sync (Google Calendar / Outlook) — Pro-gated
5. Analytics dashboard — Pro-gated

Don't build social features, team dashboards, wearable companion, or AI coaching — explicitly out of scope for v1.0 per the PRD.

Status: items 1–3 are implemented (see `lib/consistency.ts`, `lib/habits.ts`, `app/page.tsx`, `components/`). Items 4–5 are UI stubs only (`components/ProLockedCard.tsx`) — no real OAuth or Stripe wiring yet, per the PRD's own roadmap which puts them in Phase 2 (v1.1).

## Tech stack

- **Framework:** Next.js (App Router), TypeScript
- **Deployment:** Vercel (auto-deploy on push to `main`; preview deploys on PRs)
- **Styling:** Tailwind CSS
- **Auth/DB:** None. This is a local-only demo build — no login, no backend. Habits and logs persist client-side via `localStorage` (`lib/storage.ts`), seeded with sample data on first load. Supabase was removed 2026-09-08 at the user's request so the app deploys to Vercel with zero external services or env vars; revisit this if/when real multi-device persistence is needed.
- **Calendar integrations:** Google Calendar API, Microsoft Graph (Outlook) — OAuth, read-only scopes only. Not yet wired (Phase 2).
- **Payments:** Stripe for the $4.99/mo Pro subscription. Not yet wired (Phase 2).
- **Tests:** Vitest (`npm test`) — see `lib/consistency.test.ts`.

## Core domain rules (get these right — they're the product)

- Every habit has three tiers: Tier 1 (<2 min, non-negotiable), Tier 2 (baseline target), Tier 3 (stretch). Logging *any* tier counts the day as complete.
- Consistency is a weighted score, never a binary streak. One missed day flags a "recovery" prompt for Tier 1 the next day; it does not reset anything. Two consecutive missed days is what triggers a reset/decay — see PRD §5.3 and `lib/consistency.ts` for exact weighting.
- Never show the user a bare "0-day streak." The UI should always frame a miss as recoverable.
- Calendar density (meeting count/hours) drives the *suggested* tier, but the user can always override it manually. (For now, without live calendar sync, the suggestion defaults to Tier 2, or Tier 1 on a recovery day.)

## Confirmed product decisions

- Consistency score display: percentage + qualitative label (e.g. "78% — Strong"), not a bare number or streak count.
- Tier defaults: pre-filled per habit category (exercise, reading, meditation, writing, sleep, custom) — see `CATEGORY_TIER_DEFAULTS` in `lib/habits.ts` — and fully editable by the user at habit creation.

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build (must pass before pushing)
- `npm run lint` — lint
- `npm test` — test suite (add tests alongside new features, especially the consistency-scoring logic — it's the riskiest part to get subtly wrong)

## Conventions

- Commit messages: short, imperative (`add tiered habit model`, not `Added tiered habit model.`)
- Open a PR for anything beyond a trivial fix; let Vercel's preview deploy generate before merging to `main`.
- Never commit secrets (OAuth client secrets, Stripe keys, DB URLs). All of these go in Vercel's Environment Variables panel and are read via `process.env` locally from a gitignored `.env.local` (see `.env.local.example` for the required keys).
- Flag any deviation from the PRD's scope or scoring logic before implementing it — ask first, don't assume.

## Open questions (from the PRD — ask me if these come up)

- Where the Slack closeout webhook posts (personal vs. team channel) — not relevant until Phase 3 (Slack integration is out of v1.0 scope).
