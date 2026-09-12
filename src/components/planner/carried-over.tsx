import { rescheduleTask, deleteTask } from "@/lib/actions/tasks";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton } from "@/components/submit-button";
import { Trash2 } from "lucide-react";
import type { Task } from "@/lib/types";

export function CarriedOver({
  tasks,
  todayStr,
  revalidatePath,
}: {
  tasks: Task[];
  todayStr: string;
  revalidatePath: string;
}) {
  if (tasks.length === 0) return null;

  return (
    <div className="rounded-xl border border-accent-soft bg-accent-soft/40 p-4">
      <h2 className="font-display text-sm font-semibold text-ink">
        Carried over from before ({tasks.length})
      </h2>
      <div className="mt-2 flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2.5 rounded-lg bg-raised px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-sm text-ink">{task.title}</span>
            <span className="shrink-0 text-xs text-ink-soft">was {task.scheduled_date ?? task.due_date}</span>
            <form action={rescheduleTask}>
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="scheduledDate" value={todayStr} />
              <input type="hidden" name="revalidatePath" value={revalidatePath} />
              <SubmitButton
                pendingText="Moving…"
                className="shrink-0 rounded-md border border-border px-2 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                Move to today
              </SubmitButton>
            </form>
            <form action={deleteTask}>
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="revalidatePath" value={revalidatePath} />
              <ConfirmSubmitButton
                confirmMessage="Delete this task?"
                aria-label="Delete task"
                className="shrink-0 rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
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
