import { Trash2 } from "lucide-react";
import { createMilestone, toggleMilestoneStatus, deleteMilestone } from "@/lib/actions/milestones";
import { TaskCheckbox } from "@/components/task-checkbox";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton } from "@/components/submit-button";
import type { Milestone } from "@/lib/types";

export function MilestonesSection({ goalId, milestones }: { goalId: string; milestones: Milestone[] }) {
  const sorted = [...milestones].sort((a, b) => a.order_index - b.order_index);

  return (
    <div>
      <h2 className="font-display text-base font-semibold text-ink">Milestones</h2>
      <p className="mt-1 text-sm text-ink-soft">The big checkpoints on the way, in order.</p>

      <form action={createMilestone} className="mt-3 flex items-center gap-2">
        <input type="hidden" name="goalId" value={goalId} />
        <input
          type="text"
          name="title"
          placeholder="Add a milestone…"
          required
          className="min-w-0 flex-1 rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <SubmitButton
          pendingText="Adding…"
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Add
        </SubmitButton>
      </form>

      <div className="mt-3 flex max-h-[28rem] flex-col gap-1.5 overflow-y-auto pr-1">
        {sorted.length === 0 && (
          <p className="py-4 text-center text-sm text-ink-soft">No milestones yet — optional, add them if they help.</p>
        )}
        {sorted.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-raised px-3 py-2.5"
          >
            <form action={toggleMilestoneStatus} className="contents">
              <input type="hidden" name="milestoneId" value={m.id} />
              <input type="hidden" name="goalId" value={goalId} />
              <TaskCheckbox defaultChecked={m.status === "done"} />
            </form>
            <span
              className={`flex-1 text-sm ${m.status === "done" ? "text-ink-soft line-through" : "text-ink"}`}
            >
              {m.title}
            </span>
            <form action={deleteMilestone}>
              <input type="hidden" name="milestoneId" value={m.id} />
              <input type="hidden" name="goalId" value={goalId} />
              <ConfirmSubmitButton
                confirmMessage="Delete this milestone?"
                aria-label="Delete milestone"
                className="rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
              >
                <Trash2 size={14} />
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
