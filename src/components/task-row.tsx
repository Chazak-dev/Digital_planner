import { Trash2 } from "lucide-react";
import { createTask, toggleTaskStatus, deleteTask, updateTaskDetails } from "@/lib/actions/tasks";
import { TaskCheckbox } from "@/components/task-checkbox";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton } from "@/components/submit-button";
import type { Task } from "@/lib/types";

export function TaskRow({
  task,
  subtasks,
  hiddenFields,
  revalidatePath,
}: {
  task: Task;
  subtasks: Task[];
  hiddenFields: Record<string, string>;
  revalidatePath: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-raised px-3 py-2.5">
      <div className="flex items-center gap-3">
        <form action={toggleTaskStatus} className="contents">
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="revalidatePath" value={revalidatePath} />
          <TaskCheckbox defaultChecked={task.status === "done"} />
        </form>

        <details className="min-w-0 flex-1 group">
          <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
            <span
              className={`flex-1 truncate text-sm ${
                task.status === "done" ? "text-ink-soft line-through" : "text-ink"
              }`}
            >
              {task.title}
            </span>
            {task.priority === "must" && task.status !== "done" && (
              <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-accent">
                Must
              </span>
            )}
            {subtasks.length > 0 && (
              <span className="shrink-0 text-[11px] text-ink-soft">
                {subtasks.filter((s) => s.status === "done").length}/{subtasks.length}
              </span>
            )}
            {task.scheduled_date && (
              <span className="shrink-0 text-xs text-ink-soft">
                {task.scheduled_date}
                {task.scheduled_time ? ` ${task.scheduled_time.slice(0, 5)}` : ""}
              </span>
            )}
          </summary>

          <div className="mt-3 flex flex-col gap-4 border-t border-border pt-3">
            <form action={updateTaskDetails} className="flex flex-col gap-2.5">
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="revalidatePath" value={revalidatePath} />

              <textarea
                name="description"
                placeholder="Description…"
                defaultValue={task.description ?? ""}
                rows={2}
                className="rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
              <textarea
                name="notes"
                placeholder="Notes…"
                defaultValue={task.notes ?? ""}
                rows={2}
                className="rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <label className="flex flex-col gap-1 text-xs text-ink-soft">
                  Due date
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={task.due_date ?? ""}
                    className="rounded-lg border border-border bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-ink-soft">
                  Scheduled
                  <input
                    type="date"
                    name="scheduledDate"
                    defaultValue={task.scheduled_date ?? ""}
                    className="rounded-lg border border-border bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-ink-soft">
                  Time <span className="normal-case">(optional)</span>
                  <input
                    type="time"
                    name="scheduledTime"
                    defaultValue={task.scheduled_time ?? ""}
                    className="rounded-lg border border-border bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-ink-soft">
                  Minutes
                  <input
                    type="number"
                    name="estimatedMinutes"
                    defaultValue={task.estimated_minutes ?? ""}
                    className="rounded-lg border border-border bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-ink-soft">
                  Energy
                  <select
                    name="energyLevel"
                    defaultValue={task.energy_level ?? ""}
                    className="rounded-lg border border-border bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
                  >
                    <option value="">—</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs text-ink-soft">
                  Priority
                  <select
                    name="priority"
                    defaultValue={task.priority}
                    className="rounded-lg border border-border bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
                  >
                    <option value="must">Must</option>
                    <option value="should">Should</option>
                    <option value="could">Could</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs text-ink-soft">
                  Tags <span className="normal-case">(comma separated)</span>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={task.tags.join(", ")}
                    className="rounded-lg border border-border bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
                  />
                </label>
              </div>

              <SubmitButton
                pendingText="Saving…"
                className="self-start rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                Save details
              </SubmitButton>
            </form>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Subtasks</p>
              <div className="mt-2 flex flex-col gap-1">
                {subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2.5">
                    <form action={toggleTaskStatus} className="contents">
                      <input type="hidden" name="taskId" value={sub.id} />
                      <input type="hidden" name="revalidatePath" value={revalidatePath} />
                      <TaskCheckbox defaultChecked={sub.status === "done"} />
                    </form>
                    <span
                      className={`flex-1 text-sm ${
                        sub.status === "done" ? "text-ink-soft line-through" : "text-ink"
                      }`}
                    >
                      {sub.title}
                    </span>
                    <form action={deleteTask}>
                      <input type="hidden" name="taskId" value={sub.id} />
                      <input type="hidden" name="revalidatePath" value={revalidatePath} />
                      <ConfirmSubmitButton
                        confirmMessage="Delete this subtask?"
                        aria-label="Delete subtask"
                        className="rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                      >
                        <Trash2 size={13} />
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                ))}
              </div>
              <form action={createTask} className="mt-2 flex items-center gap-2">
                {Object.entries(hiddenFields).map(([key, value]) => (
                  <input key={key} type="hidden" name={key} value={value} />
                ))}
                <input type="hidden" name="parentTaskId" value={task.id} />
                <input type="hidden" name="revalidatePath" value={revalidatePath} />
                <input
                  type="text"
                  name="title"
                  placeholder="Add a subtask…"
                  required
                  className="min-w-0 flex-1 rounded-lg border border-border bg-paper px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent"
                />
                <SubmitButton
                  pendingText="Adding…"
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
                >
                  Add
                </SubmitButton>
              </form>
            </div>
          </div>
        </details>

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
    </div>
  );
}
