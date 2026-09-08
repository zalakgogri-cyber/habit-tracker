"use client";

import type { Habit } from "@/lib/habits";
import type { ConsistencyState, Tier } from "@/lib/consistency";
import { ConsistencyGauge } from "./ConsistencyGauge";

const TIER_LABELS: Record<Tier, string> = {
  1: "Tier 1 · Non-negotiable",
  2: "Tier 2 · Target",
  3: "Tier 3 · Stretch",
};

export function HabitCard({
  habit,
  consistency,
  suggestedTier,
  loggedTierToday,
  onLog,
}: {
  habit: Habit;
  consistency: ConsistencyState;
  suggestedTier: Tier;
  loggedTierToday: Tier | null;
  onLog: (tier: Tier) => void;
}) {
  const tierDescriptions: Record<Tier, string> = {
    1: habit.tier1_description,
    2: habit.tier2_description,
    3: habit.tier3_description,
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-neutral-900">{habit.name}</h3>
          {consistency.needsRecovery ? (
            <p className="text-xs text-amber-600 mt-0.5">
              Yesterday was missed — no big deal. Today&apos;s a recovery day, just hit Tier 1.
            </p>
          ) : (
            <p className="text-xs text-neutral-500 mt-0.5">
              Suggested today: {TIER_LABELS[suggestedTier]}
            </p>
          )}
        </div>
        {loggedTierToday && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
            Logged
          </span>
        )}
      </div>

      <ConsistencyGauge state={consistency} />

      <div className="grid grid-cols-3 gap-2 pt-1">
        {([1, 2, 3] as Tier[]).map((tier) => {
          const isSuggested = tier === suggestedTier && !loggedTierToday;
          const isLogged = loggedTierToday === tier;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => onLog(tier)}
              title={tierDescriptions[tier]}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition disabled:opacity-50 ${
                isLogged
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : isSuggested
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
              }`}
            >
              T{tier}
            </button>
          );
        })}
      </div>
    </div>
  );
}
