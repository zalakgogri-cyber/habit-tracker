import type { ConsistencyState } from "@/lib/consistency";

const LABEL_COLORS: Record<ConsistencyState["label"], string> = {
  Strong: "text-emerald-600 bg-emerald-50 ring-emerald-200",
  Steady: "text-blue-600 bg-blue-50 ring-blue-200",
  Recovering: "text-amber-600 bg-amber-50 ring-amber-200",
  "Starting Out": "text-neutral-600 bg-neutral-50 ring-neutral-200",
};

const BAR_COLORS: Record<ConsistencyState["label"], string> = {
  Strong: "bg-emerald-500",
  Steady: "bg-blue-500",
  Recovering: "bg-amber-500",
  "Starting Out": "bg-neutral-400",
};

/**
 * Always renders a percentage + qualitative label — never a bare streak
 * number — per PRD §5.3 ("never show a plain 0-day streak").
 */
export function ConsistencyGauge({ state }: { state: ConsistencyState }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${LABEL_COLORS[state.label]}`}
        >
          {state.label}
        </span>
        <span className="font-medium text-neutral-700">{state.score}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full ${BAR_COLORS[state.label]} transition-all`}
          style={{ width: `${state.score}%` }}
        />
      </div>
    </div>
  );
}
