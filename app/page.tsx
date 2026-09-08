import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeConsistency, type Tier } from "@/lib/consistency";
import type { Habit } from "@/lib/habits";
import { HabitCard } from "@/components/HabitCard";
import { EveningShutdown } from "@/components/EveningShutdown";
import { ProLockedCard } from "@/components/ProLockedCard";
import { signOut } from "@/app/actions";

const HISTORY_DAYS = 90;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // middleware redirects to /login
  }

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .order("created_at", { ascending: true });

  const since = new Date();
  since.setDate(since.getDate() - HISTORY_DAYS);
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("habit_id, log_date, tier")
    .gte("log_date", since.toISOString().slice(0, 10));

  const today = new Date().toISOString().slice(0, 10);

  const rows = (habits ?? []).map((habit: Habit) => {
    const habitLogs = (logs ?? [])
      .filter((l) => l.habit_id === habit.id)
      .map((l) => ({ date: l.log_date as string, tier: l.tier as Tier }));

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

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Today</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-neutral-400 hover:text-neutral-700">
            Sign out
          </button>
        </form>
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

      <EveningShutdown pending={pendingForShutdown} />
    </main>
  );
}
