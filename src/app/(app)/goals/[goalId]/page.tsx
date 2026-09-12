import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProgressRing } from "@/components/progress-ring";
import { ProgressControl } from "@/components/goals/progress-control";
import { MilestonesSection } from "@/components/goals/milestones-section";
import { TaskList } from "@/components/task-list";
import { NotesSection } from "@/components/goals/notes-section";
import { ProgressHistoryList } from "@/components/goals/progress-history-list";
import { formatDate, type DateFormat } from "@/lib/format-date";
import type { Goal, Milestone, Note, ProgressHistoryEntry, Task } from "@/lib/types";

const CATEGORY_LABEL: Record<Goal["category"], string> = {
  career: "Career",
  certification: "Certification",
  skill: "Skill",
  project: "Project",
  health: "Health",
  habit: "Habit",
  other: "Other",
};

export default async function GoalPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();

  const [{ data: goal }, { data: milestones }, { data: tasks }, { data: notes }, { data: history }, { data: profile }] =
    await Promise.all([
      supabase.from("goals").select("*").eq("id", goalId).maybeSingle(),
      supabase.from("milestones").select("*").eq("goal_id", goalId).order("order_index"),
      supabase.from("tasks").select("*").eq("goal_id", goalId).order("created_at"),
      supabase
        .from("notes")
        .select("*")
        .eq("owner_type", "goal")
        .eq("owner_id", goalId)
        .order("created_at", { ascending: false }),
      supabase
        .from("progress_history")
        .select("*")
        .eq("goal_id", goalId)
        .order("recorded_at", { ascending: false }),
      auth.user
        ? supabase.from("profiles").select("date_format").eq("id", auth.user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (!goal) notFound();
  const g = goal as Goal;
  const dateFormat = (profile?.date_format as DateFormat) ?? "MM/DD/YYYY";

  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/goals" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-accent">
          <ArrowLeft size={15} /> Goals
        </Link>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <ProgressRing percent={g.progress_percent} color={g.color} size={64} stroke={6} />
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">
                {g.icon ? `${g.icon} ` : ""}
                {g.title}
              </h1>
              <p className="mt-0.5 text-sm text-ink-soft">
                {[
                  CATEGORY_LABEL[g.category],
                  g.priority === "high" ? "High priority" : null,
                  g.deadline ? `due ${formatDate(g.deadline, dateFormat)}` : "no deadline",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {g.description && <p className="mt-2 max-w-md text-sm text-ink-soft">{g.description}</p>}
            </div>
          </div>
          <Link
            href={`/goals/${goalId}/edit`}
            aria-label="Edit goal"
            className="shrink-0 rounded-md p-2 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
          >
            <Pencil size={16} />
          </Link>
        </div>

        <div className="mt-5">
          <ProgressControl goalId={goalId} progressMode={g.progress_mode} progressPercent={g.progress_percent} />
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <MilestonesSection goalId={goalId} milestones={(milestones ?? []) as Milestone[]} />

          <div>
            <h2 className="font-display text-base font-semibold text-ink">Tasks</h2>
            <div className="mt-3">
              <TaskList
                tasks={(tasks ?? []) as Task[]}
                hiddenFields={{ area: "personal", goalId }}
                revalidatePath={`/goals/${goalId}`}
                emptyMessage="No tasks yet — break this goal down whenever you're ready."
              />
            </div>
          </div>

          <NotesSection goalId={goalId} notes={(notes ?? []) as Note[]} />

          <ProgressHistoryList entries={(history ?? []) as ProgressHistoryEntry[]} />
        </div>
      </div>
    </div>
  );
}
