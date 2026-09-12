"use client";

import { useState } from "react";
import Link from "next/link";
import { Target } from "lucide-react";
import { ProgressRing } from "@/components/progress-ring";
import { formatDate, type DateFormat } from "@/lib/format-date";
import type { Goal, GoalCategory } from "@/lib/types";

const CATEGORY_LABEL: Record<GoalCategory, string> = {
  career: "Career",
  certification: "Certification",
  skill: "Skill",
  project: "Project",
  health: "Health",
  habit: "Habit",
  other: "Other",
};

const CATEGORIES = Object.keys(CATEGORY_LABEL) as GoalCategory[];

function GoalCard({ goal, muted, dateFormat }: { goal: Goal; muted?: boolean; dateFormat: DateFormat }) {
  return (
    <Link
      href={`/goals/${goal.id}`}
      className={`flex items-center gap-4 rounded-xl border border-border bg-raised p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md ${
        muted ? "opacity-70 hover:opacity-100" : ""
      }`}
    >
      <ProgressRing percent={goal.progress_percent} color={goal.color} size={48} stroke={5} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">
          {goal.icon ? `${goal.icon} ` : ""}
          {goal.title}
        </p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {CATEGORY_LABEL[goal.category]}
          {goal.deadline ? ` · due ${formatDate(goal.deadline, dateFormat)}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function GoalsFilterGrid({ goals, dateFormat }: { goals: Goal[]; dateFormat: DateFormat }) {
  const [category, setCategory] = useState<GoalCategory | "all">("all");

  if (goals.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-raised px-6 py-16 text-center">
        <Target className="text-ink-soft" size={28} />
        <p className="mt-3 text-sm font-medium text-ink">No goals yet</p>
        <p className="mt-1 max-w-xs text-sm text-ink-soft">
          Add something you&apos;re working toward — a deadline is optional.
        </p>
        <Link
          href="/goals/new"
          className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Add a goal
        </Link>
      </div>
    );
  }

  const usedCategories = CATEGORIES.filter((c) => goals.some((g) => g.category === c));
  const filtered = category === "all" ? goals : goals.filter((g) => g.category === category);
  const active = filtered.filter((g) => g.status !== "completed");
  const completed = filtered.filter((g) => g.status === "completed");

  return (
    <div>
      {usedCategories.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === "all" ? "bg-accent text-white" : "bg-accent-soft text-ink-soft hover:text-ink"
            }`}
          >
            All
          </button>
          {usedCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === c ? "bg-accent text-white" : "bg-accent-soft text-ink-soft hover:text-ink"
              }`}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      )}

      {active.length === 0 && completed.length === 0 ? (
        <p className="mt-8 text-sm text-ink-soft">No goals in this category.</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {active.map((goal) => (
              <GoalCard key={goal.id} goal={goal} dateFormat={dateFormat} />
            ))}
          </div>

          {completed.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Completed</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {completed.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} muted dateFormat={dateFormat} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
