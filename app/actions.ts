"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { HabitCategory } from "@/lib/habits";

export async function createHabit(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "custom") as HabitCategory;
  const tier1 = String(formData.get("tier1") ?? "").trim();
  const tier2 = String(formData.get("tier2") ?? "").trim();
  const tier3 = String(formData.get("tier3") ?? "").trim();

  if (!name || !tier1 || !tier2 || !tier3) {
    throw new Error("Habit name and all three tiers are required.");
  }

  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    name,
    category,
    tier1_description: tier1,
    tier2_description: tier2,
    tier3_description: tier3,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect("/");
}

export async function logHabitTier(habitId: string, tier: 1 | 2 | 3) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("habit_logs")
    .upsert(
      { habit_id: habitId, user_id: user.id, log_date: today, tier },
      { onConflict: "habit_id,log_date" }
    );

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
