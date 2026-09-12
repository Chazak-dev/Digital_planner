import { createTask } from "@/lib/actions/tasks";
import { SubmitButton } from "@/components/submit-button";
import { DndTaskBoard } from "@/components/planner/dnd-task-board";
import type { Task } from "@/lib/types";

export function DailyBoard({
  tasks,
  dateStr,
  revalidatePath,
}: {
  tasks: Task[];
  dateStr: string;
  revalidatePath: string;
}) {
  return (
    <div>
      <form action={createTask} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="area" value="personal" />
        <input type="hidden" name="revalidatePath" value={revalidatePath} />
        <input
          type="text"
          name="title"
          placeholder="Add a task for this day…"
          required
          className="min-w-0 flex-1 rounded-lg border border-border bg-raised px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <input
          type="date"
          name="scheduledDate"
          defaultValue={dateStr}
          className="rounded-lg border border-border bg-raised px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <select
          name="priority"
          defaultValue="should"
          className="rounded-lg border border-border bg-raised px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="must">Must</option>
          <option value="should">Should</option>
          <option value="could">Could</option>
        </select>
        <SubmitButton
          pendingText="Adding…"
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Add
        </SubmitButton>
      </form>

      <p className="mt-2 text-xs text-ink-soft">
        Click a task for details, or drag the ⠿ handle to reorder or change Must/Should/Could.
      </p>

      <div className="mt-3">
        <DndTaskBoard tasks={tasks} hiddenFields={{ area: "personal" }} revalidatePath={revalidatePath} />
      </div>
    </div>
  );
}
