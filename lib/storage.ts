"use client";

/**
 * Client-only persistence for the demo build (no backend). Habits and logs
 * live in the visitor's browser via localStorage — this is what lets the
 * app deploy to Vercel with zero external services or env vars.
 */

import type { Habit, HabitCategory } from "./habits";
import { CATEGORY_TIER_DEFAULTS } from "./habits";
import type { Tier } from "./consistency";

export type HabitLogRecord = {
  habit_id: string;
  log_date: string;
  tier: Tier;
};

const HABITS_KEY = "pivot:habits";
const LOGS_KEY = "pivot:logs";
const SEEDED_KEY = "pivot:seeded";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function seedDemoData(): { habits: Habit[]; logs: HabitLogRecord[] } {
  const exercise: Habit = {
    id: crypto.randomUUID(),
    name: "Exercise",
    category: "exercise",
    tier1_description: CATEGORY_TIER_DEFAULTS.exercise.tier1,
    tier2_description: CATEGORY_TIER_DEFAULTS.exercise.tier2,
    tier3_description: CATEGORY_TIER_DEFAULTS.exercise.tier3,
    created_at: new Date().toISOString(),
  };
  const reading: Habit = {
    id: crypto.randomUUID(),
    name: "Reading",
    category: "reading",
    tier1_description: CATEGORY_TIER_DEFAULTS.reading.tier1,
    tier2_description: CATEGORY_TIER_DEFAULTS.reading.tier2,
    tier3_description: CATEGORY_TIER_DEFAULTS.reading.tier3,
    created_at: new Date().toISOString(),
  };

  const logs: HabitLogRecord[] = [
    // Exercise: a clean run — Strong/Steady score, nothing needs recovery.
    { habit_id: exercise.id, log_date: daysAgo(5), tier: 2 },
    { habit_id: exercise.id, log_date: daysAgo(4), tier: 2 },
    { habit_id: exercise.id, log_date: daysAgo(3), tier: 3 },
    { habit_id: exercise.id, log_date: daysAgo(2), tier: 2 },
    { habit_id: exercise.id, log_date: daysAgo(1), tier: 2 },
    // Reading: yesterday was missed — demonstrates the recovery prompt.
    { habit_id: reading.id, log_date: daysAgo(4), tier: 2 },
    { habit_id: reading.id, log_date: daysAgo(3), tier: 1 },
    { habit_id: reading.id, log_date: daysAgo(2), tier: 2 },
  ];

  return { habits: [exercise, reading], logs };
}

/** Loads habits, seeding a one-time demo set on a brand-new browser. */
export function getHabits(): Habit[] {
  if (!read(SEEDED_KEY, false)) {
    const { habits, logs } = seedDemoData();
    write(HABITS_KEY, habits);
    write(LOGS_KEY, logs);
    write(SEEDED_KEY, true);
    return habits;
  }
  return read<Habit[]>(HABITS_KEY, []);
}

export function getLogsSince(sinceDate: string): HabitLogRecord[] {
  return read<HabitLogRecord[]>(LOGS_KEY, []).filter((l) => l.log_date >= sinceDate);
}

export function createHabit(input: {
  name: string;
  category: HabitCategory;
  tier1: string;
  tier2: string;
  tier3: string;
}): Habit {
  const habit: Habit = {
    id: crypto.randomUUID(),
    name: input.name,
    category: input.category,
    tier1_description: input.tier1,
    tier2_description: input.tier2,
    tier3_description: input.tier3,
    created_at: new Date().toISOString(),
  };
  const habits = read<Habit[]>(HABITS_KEY, []);
  write(HABITS_KEY, [...habits, habit]);
  return habit;
}

export function logHabitTier(habitId: string, tier: Tier): void {
  const today = isoDate(new Date());
  const logs = read<HabitLogRecord[]>(LOGS_KEY, []);
  const existingIndex = logs.findIndex((l) => l.habit_id === habitId && l.log_date === today);
  if (existingIndex >= 0) {
    logs[existingIndex] = { habit_id: habitId, log_date: today, tier };
  } else {
    logs.push({ habit_id: habitId, log_date: today, tier });
  }
  write(LOGS_KEY, logs);
}

/** Wipes all local demo data and reseeds the sample habits on next load. */
export function resetDemoData(): void {
  window.localStorage.removeItem(HABITS_KEY);
  window.localStorage.removeItem(LOGS_KEY);
  window.localStorage.removeItem(SEEDED_KEY);
}
