/**
 * "Never Miss Twice" weighted consistency engine — PRD §5.3.
 *
 * Rules:
 * - Logging Tier 1 preserves the score (identity-continuity credit only).
 * - Logging Tier 2 preserves the score and adds incremental growth.
 * - Logging Tier 3 preserves the score and adds accelerated growth.
 * - One missed day: score is preserved, but the next day is flagged for a
 *   Tier 1 "recovery" prompt. Never surfaced as a "0-day streak".
 * - Two consecutive missed days: the streak resets and the score decays
 *   toward a floor gradually — it never drops straight to zero.
 */

export type Tier = 1 | 2 | 3;

export type HabitLog = {
  /** ISO date string, e.g. "2026-09-08". One entry per day at most. */
  date: string;
  tier: Tier;
};

export type ConsistencyState = {
  /** 0-100. Never a raw streak count. */
  score: number;
  /** Consecutive days logged, reset by two consecutive misses. */
  activeStreak: number;
  /** True the day after exactly one missed day — surface a Tier 1 recovery prompt. */
  needsRecovery: boolean;
  /** Qualitative label shown alongside the percentage. */
  label: "Strong" | "Steady" | "Recovering" | "Starting Out";
};

const SCORE_FLOOR = 20;
const SCORE_CEILING = 100;
const STARTING_SCORE = 50;

const TIER_GROWTH: Record<Tier, number> = {
  1: 0,
  2: 3,
  3: 6,
};

const TWO_DAY_MISS_DECAY = 15;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime()) / msPerDay);
}

function labelFor(score: number, needsRecovery: boolean): ConsistencyState["label"] {
  if (needsRecovery) return "Recovering";
  if (score >= 70) return "Strong";
  if (score >= 40) return "Steady";
  return "Starting Out";
}

/**
 * Replays a habit's log history up to (and including) `today` and returns
 * the current consistency state. Pure function — no I/O, easy to test.
 */
export function computeConsistency(logs: HabitLog[], today: Date = new Date()): ConsistencyState {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const todayIso = isoDate(today);

  let score = STARTING_SCORE;
  let activeStreak = 0;
  let needsRecovery = false;
  let lastLoggedDate: string | null = null;

  for (const log of sorted) {
    if (log.date > todayIso) continue;

    if (lastLoggedDate === null) {
      activeStreak = 1;
    } else {
      const gap = daysBetween(lastLoggedDate, log.date);
      if (gap === 1) {
        // Consecutive day — streak continues.
        activeStreak += 1;
      } else if (gap === 2) {
        // Exactly one day missed in between — forgiven, streak preserved.
        activeStreak += 1;
      } else if (gap >= 3) {
        // Two or more consecutive missed days — streak resets, score decays.
        score = Math.max(SCORE_FLOOR, score - TWO_DAY_MISS_DECAY);
        activeStreak = 1;
      }
      // gap === 0 (duplicate log for the same day) is a no-op.
    }

    score = Math.min(SCORE_CEILING, score + TIER_GROWTH[log.tier]);
    lastLoggedDate = log.date;
  }

  if (lastLoggedDate !== null) {
    const gapToToday = daysBetween(lastLoggedDate, todayIso);
    if (gapToToday === 2) {
      // Exactly one day missed (yesterday) — today is the recovery day.
      needsRecovery = true;
    } else if (gapToToday >= 3) {
      // Two or more consecutive missed days.
      score = Math.max(SCORE_FLOOR, score - TWO_DAY_MISS_DECAY);
      activeStreak = 0;
    }
  }

  return {
    score: Math.round(score),
    activeStreak,
    needsRecovery,
    label: labelFor(score, needsRecovery),
  };
}

/** Convenience formatter matching the confirmed "percentage + label" display. */
export function formatConsistency(state: ConsistencyState): string {
  return `${state.score}% — ${state.label}`;
}
