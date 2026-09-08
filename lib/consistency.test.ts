import { describe, expect, it } from "vitest";
import { computeConsistency, formatConsistency, type HabitLog } from "./consistency";

const today = new Date("2026-09-08T12:00:00Z");

describe("computeConsistency", () => {
  it("returns a neutral starting state with no logs", () => {
    const state = computeConsistency([], today);
    expect(state.score).toBe(50);
    expect(state.activeStreak).toBe(0);
    expect(state.needsRecovery).toBe(false);
  });

  it("preserves score on a Tier 1 log without growing it", () => {
    const logs: HabitLog[] = [{ date: "2026-09-08", tier: 1 }];
    const state = computeConsistency(logs, today);
    expect(state.score).toBe(50);
    expect(state.activeStreak).toBe(1);
  });

  it("grows score faster for Tier 3 than Tier 2", () => {
    const tier2 = computeConsistency([{ date: "2026-09-08", tier: 2 }], today);
    const tier3 = computeConsistency([{ date: "2026-09-08", tier: 3 }], today);
    expect(tier3.score).toBeGreaterThan(tier2.score);
  });

  it("flags a recovery prompt after exactly one missed day, without resetting score", () => {
    const logs: HabitLog[] = [{ date: "2026-09-06", tier: 2 }];
    // today is 2026-09-08 -> 2026-09-07 was missed, one day gap to today
    const state = computeConsistency(logs, today);
    expect(state.needsRecovery).toBe(true);
    expect(state.score).toBe(53); // preserved + tier-2 growth from the log itself
  });

  it("never reports a literal 0-day streak label after a single miss", () => {
    const logs: HabitLog[] = [{ date: "2026-09-06", tier: 1 }];
    const state = computeConsistency(logs, today);
    expect(state.label).not.toBe("0-day streak");
    expect(state.label).toBe("Recovering");
  });

  it("resets the active streak and decays the score after two consecutive missed days", () => {
    const logs: HabitLog[] = [{ date: "2026-09-05", tier: 3 }];
    // 09-06 and 09-07 both missed relative to today (09-08)
    const state = computeConsistency(logs, today);
    expect(state.activeStreak).toBe(0);
    expect(state.score).toBeLessThan(56);
    expect(state.score).toBeGreaterThanOrEqual(20);
  });

  it("decays gradually rather than collapsing to zero", () => {
    const logs: HabitLog[] = [{ date: "2026-08-01", tier: 3 }];
    const state = computeConsistency(logs, today);
    expect(state.score).toBeGreaterThan(0);
  });

  it("builds a streak across consecutive logged days", () => {
    const logs: HabitLog[] = [
      { date: "2026-09-06", tier: 2 },
      { date: "2026-09-07", tier: 2 },
      { date: "2026-09-08", tier: 2 },
    ];
    const state = computeConsistency(logs, today);
    expect(state.activeStreak).toBe(3);
    expect(state.needsRecovery).toBe(false);
  });

  it("caps the score at 100", () => {
    const logs: HabitLog[] = Array.from({ length: 40 }, (_, i) => ({
      date: `2026-0${i < 9 ? 8 : 9}-${String((i % 28) + 1).padStart(2, "0")}`,
      tier: 3 as const,
    }));
    const state = computeConsistency(logs, today);
    expect(state.score).toBeLessThanOrEqual(100);
  });

  it("formats as percentage + qualitative label", () => {
    const state = computeConsistency([{ date: "2026-09-08", tier: 3 }], today);
    expect(formatConsistency(state)).toMatch(/^\d+% — (Strong|Steady|Recovering|Starting Out)$/);
  });
});
