import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateGoal, deleteGoal } from "@/lib/actions/goals";
import { ColorPicker } from "@/components/color-picker";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton } from "@/components/submit-button";
import type { Goal } from "@/lib/types";

export default async function EditGoalPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  const supabase = await createClient();
  const { data: goal } = await supabase.from("goals").select("*").eq("id", goalId).maybeSingle();

  if (!goal) notFound();
  const g = goal as Goal;

  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-md">
        <Link
          href={`/goals/${goalId}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-accent"
        >
          <ArrowLeft size={15} /> {g.title}
        </Link>

        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Edit goal</h1>

        <form action={updateGoal} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="goalId" value={goalId} />

          <label className="flex flex-col gap-1 text-sm text-ink">
            Title
            <input
              type="text"
              name="title"
              required
              defaultValue={g.title}
              className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Description
            <textarea
              name="description"
              rows={2}
              defaultValue={g.description ?? ""}
              className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Category
              <select
                name="category"
                defaultValue={g.category}
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              >
                <option value="career">Career</option>
                <option value="certification">Certification</option>
                <option value="skill">Skill</option>
                <option value="project">Project</option>
                <option value="health">Health</option>
                <option value="habit">Habit</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Priority
              <select
                name="priority"
                defaultValue={g.priority}
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Status
              <select
                name="status"
                defaultValue={g.status}
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              >
                <option value="flexible">Flexible</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Icon
              <input
                type="text"
                name="icon"
                maxLength={4}
                defaultValue={g.icon ?? ""}
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              />
            </label>
          </div>

          <div className="flex flex-col gap-1.5 text-sm text-ink">
            Color
            <ColorPicker name="color" defaultValue={g.color} />
          </div>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Deadline
            <input
              type="date"
              name="deadline"
              defaultValue={g.deadline ?? ""}
              className="w-48 rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <SubmitButton
            pendingText="Saving…"
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save changes
          </SubmitButton>
        </form>

        <form action={deleteGoal} className="mt-8 border-t border-border pt-6">
          <input type="hidden" name="goalId" value={goalId} />
          <ConfirmSubmitButton
            confirmMessage={`Delete "${g.title}"? This removes its milestones, notes, and progress history. Tasks you made for it stay, just unlinked.`}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-accent"
          >
            <Trash2 size={15} /> Delete goal
          </ConfirmSubmitButton>
        </form>
      </div>
    </div>
  );
}
