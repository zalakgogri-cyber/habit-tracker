"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { computeConsistency, type Tier } from "@/lib/consistency";
import type { Habit } from "@/lib/habits";
import { getHabits, getLogsSince, logHabitTier, resetDemoData, type HabitLogRecord } from "@/lib/storage";
import { HabitCard } from "@/components/HabitCard";
import { EveningShutdown } from "@/components/EveningShutdown";
import { ProLockedCard } from "@/components/ProLockedCard";

const HISTORY_DAYS = 90;

type Loaded = { habits: Habit[]; logs: HabitLogRecord[] };

function loadFromStorage(): Loaded {
  const since = new Date();
  since.setDate(since.getDate() - HISTORY_DAYS);
  return {
    habits: getHabits(),
    logs: getLogsSince(since.toISOString().slice(0, 10)),
  };
}

export default function DashboardPage() {
  // localStorage isn't available during SSR, so state starts empty and is
  // hydrated once on mount — a one-time read from a browser-only store, not
  // derived state, hence the effect rather than computing it during render.
  const [data, setData] = useState<Loaded | null>(null);
  const { habits, logs } = data ?? { habits: [], logs: [] };

  useEffect(() => {
    // localStorage is unavailable during SSR; this is a one-time hydration
    // read on mount, not state derived from props/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loadFromStorage());
  }, []);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const rows = habits.map((habit) => {
    const habitLogs = logs
      .filter((l) => l.habit_id === habit.id)
      .map((l) => ({ date: l.log_date, tier: l.tier }));

    const consistency = computeConsistency(habitLogs);
    const loggedToday = habitLogs.find((l) => l.date === today);
    const suggestedTier: Tier = consistency.needsRecovery ? 1 : 2;

    return {
      habit,
      consistency,
      suggestedTier,
      loggedTierToday: loggedToday ? loggedToday.tier : null,
    };
  });

  const pendingForShutdown = rows
    .filter((r) => !r.loggedTierToday)
    .map((r) => ({ habit: r.habit, suggestedTier: r.suggestedTier }));

  function handleLog(habitId: string, tier: Tier) {
    logHabitTier(habitId, tier);
    setData((prev) => {
      const prevLogs = prev?.logs ?? [];
      const existingIndex = prevLogs.findIndex((l) => l.habit_id === habitId && l.log_date === today);
      const next = { habit_id: habitId, log_date: today, tier };
      const nextLogs =
        existingIndex >= 0
          ? prevLogs.map((l, i) => (i === existingIndex ? next : l))
          : [...prevLogs, next];
      return { habits: prev?.habits ?? [], logs: nextLogs };
    });
  }

  function handleReset() {
    resetDemoData();
    setData(loadFromStorage());
  }

  if (!data) return null;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Today</h1>
          <p className="text-sm text-neutral-500">Demo — stored in this browser only</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-neutral-400 hover:text-neutral-700"
        >
          Reset demo
        </button>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            No habits yet. Start with one — you can always add more.
          </div>
        )}
        {rows.map(({ habit, consistency, suggestedTier, loggedTierToday }) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            consistency={consistency}
            suggestedTier={suggestedTier}
            loggedTierToday={loggedTierToday}
            onLog={(tier) => handleLog(habit.id, tier)}
          />
        ))}
      </div>

      <Link
        href="/habits/new"
        className="mt-4 block w-full rounded-xl border border-neutral-300 py-2.5 text-center text-sm font-medium text-neutral-700 hover:border-neutral-500"
      >
        + Add habit
      </Link>

      <div className="mt-10 space-y-3">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
          Pro features
        </h2>
        <ProLockedCard
          title="Smart Calendar Sync"
          description="Connect Google Calendar or Outlook so Pivot suggests today's tier based on your real meeting load."
        />
        <ProLockedCard
          title="Consistency Analytics"
          description="Trends across every habit, tier distribution over time, and recovery-day patterns."
        />
      </div>

      <EveningShutdown pending={pendingForShutdown} onLog={handleLog} />
    </main>
  );
}
