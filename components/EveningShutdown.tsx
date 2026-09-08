"use client";

import { useEffect, useState, useTransition } from "react";
import { logHabitTier } from "@/app/actions";
import type { Habit } from "@/lib/habits";
import type { Tier } from "@/lib/consistency";

const DEFAULT_SHUTDOWN_HOUR = 17;
const DEFAULT_SHUTDOWN_MINUTE = 30;

type PendingHabit = { habit: Habit; suggestedTier: Tier };

/**
 * Web equivalent of the lock-screen / home-screen Evening Shutdown widget
 * (PRD §5.4): a persistent end-of-day prompt for any habit not yet logged.
 * Dismissible per session, reappears the following day.
 */
export function EveningShutdown({ pending }: { pending: PendingHabit[] }) {
  const [dismissed, setDismissed] = useState(false);
  const [isPastShutdown, setIsPastShutdown] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const pastShutdown =
        now.getHours() > DEFAULT_SHUTDOWN_HOUR ||
        (now.getHours() === DEFAULT_SHUTDOWN_HOUR && now.getMinutes() >= DEFAULT_SHUTDOWN_MINUTE);
      setIsPastShutdown(pastShutdown);
    };
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!isPastShutdown || dismissed || pending.length === 0) return null;

  function handleLog(habitId: string, tier: Tier) {
    startTransition(() => {
      logHabitTier(habitId, tier);
    });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-neutral-900">
            Evening shutdown — {pending.length} habit{pending.length === 1 ? "" : "s"} left
          </p>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-xs text-neutral-400 hover:text-neutral-600"
          >
            Dismiss
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {pending.map(({ habit, suggestedTier }) => (
            <button
              key={habit.id}
              type="button"
              disabled={isPending}
              onClick={() => handleLog(habit.id, suggestedTier)}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-900 disabled:opacity-50"
            >
              {habit.name} · Tier {suggestedTier}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
