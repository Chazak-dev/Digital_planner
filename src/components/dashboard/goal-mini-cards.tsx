import Link from "next/link";
import { ProgressRing } from "@/components/progress-ring";
import type { Goal } from "@/lib/types";

export function GoalMiniCards({ goals }: { goals: Goal[] }) {
  return (
    <div className="rounded-xl border border-border bg-raised p-4">
      <h2 className="font-display text-base font-semibold text-ink">Active goals</h2>
      {goals.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">No active goals right now.</p>
      ) : (
        <div className="mt-3 flex max-h-56 flex-col gap-2.5 overflow-y-auto pr-1">
          {goals.map((goal) => (
            <Link key={goal.id} href={`/goals/${goal.id}`} className="flex items-center gap-3">
              <ProgressRing percent={goal.progress_percent} color={goal.color} size={32} stroke={4} />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">
                {goal.icon ? `${goal.icon} ` : ""}
                {goal.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
