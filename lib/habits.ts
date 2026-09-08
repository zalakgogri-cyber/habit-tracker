export type HabitCategory =
  | "exercise"
  | "reading"
  | "meditation"
  | "writing"
  | "sleep"
  | "custom";

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  category: HabitCategory;
  tier1_description: string;
  tier2_description: string;
  tier3_description: string;
  created_at: string;
};

export const HABIT_CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: "exercise", label: "Exercise" },
  { value: "reading", label: "Reading" },
  { value: "meditation", label: "Meditation" },
  { value: "writing", label: "Writing" },
  { value: "sleep", label: "Sleep" },
  { value: "custom", label: "Custom" },
];

/** Smart tier defaults per category — PRD §5.1 acceptance criteria. Editable by the user. */
export const CATEGORY_TIER_DEFAULTS: Record<
  HabitCategory,
  { tier1: string; tier2: string; tier3: string }
> = {
  exercise: {
    tier1: "5 push-ups or a 2-minute walk",
    tier2: "30-minute workout",
    tier3: "60-minute workout or class",
  },
  reading: {
    tier1: "Read 1 page",
    tier2: "Read for 20 minutes",
    tier3: "Read for 45+ minutes",
  },
  meditation: {
    tier1: "1 minute of deep breathing",
    tier2: "10-minute guided session",
    tier3: "20+ minute session",
  },
  writing: {
    tier1: "Write 1 sentence",
    tier2: "Write for 20 minutes",
    tier3: "Write 500+ words",
  },
  sleep: {
    tier1: "Lights off within 30 min of target time",
    tier2: "7+ hours in bed",
    tier3: "7+ hours with a consistent wind-down routine",
  },
  custom: {
    tier1: "",
    tier2: "",
    tier3: "",
  },
};
