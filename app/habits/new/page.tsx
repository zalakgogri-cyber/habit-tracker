"use client";

import { useState } from "react";
import Link from "next/link";
import { createHabit } from "@/app/actions";
import { CATEGORY_TIER_DEFAULTS, HABIT_CATEGORIES, type HabitCategory } from "@/lib/habits";

export default function NewHabitPage() {
  const [category, setCategory] = useState<HabitCategory>("exercise");
  const defaults = CATEGORY_TIER_DEFAULTS[category];
  const [tiers, setTiers] = useState(defaults);
  const [touched, setTouched] = useState(false);

  function handleCategoryChange(next: HabitCategory) {
    setCategory(next);
    if (!touched) {
      setTiers(CATEGORY_TIER_DEFAULTS[next]);
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Back
      </Link>
      <h1 className="mt-2 text-xl font-semibold">New habit</h1>
      <p className="text-sm text-neutral-500 mt-1">
        Define three tiers so you always have a realistic target, no matter how the day goes.
      </p>

      <form action={createHabit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Habit name</label>
          <input
            name="name"
            required
            placeholder="Exercise"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
          <select
            name="category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as HabitCategory)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          >
            {HABIT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-400 mt-1">
            Tiers below are pre-filled based on category — edit them freely.
          </p>
        </div>

        {(
          [
            ["tier1", "Tier 1 — Non-negotiable (< 2 min)", tiers.tier1],
            ["tier2", "Tier 2 — Target", tiers.tier2],
            ["tier3", "Tier 3 — Stretch", tiers.tier3],
          ] as const
        ).map(([field, label, value]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
            <input
              key={`${field}-${touched ? "touched" : category}`}
              name={field}
              required
              defaultValue={value}
              onChange={() => setTouched(true)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
        >
          Create habit
        </button>
      </form>
    </main>
  );
}
