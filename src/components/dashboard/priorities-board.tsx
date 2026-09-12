import Link from "next/link";
import { toggleTaskStatus } from "@/lib/actions/tasks";
import { TaskCheckbox } from "@/components/task-checkbox";
import type { Task } from "@/lib/types";

const COLUMNS: { key: Task["priority"]; label: string }[] = [
  { key: "must", label: "Must do" },
  { key: "should", label: "Should do" },
  { key: "could", label: "Could do" },
];

export function PrioritiesBoard({ tasks }: { tasks: Task[] }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink">Today</h2>
        <Link href="/planner" className="text-xs font-medium text-accent">
          Open planner
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Nothing due or scheduled for today. Enjoy it.</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = tasks.filter((t) => t.priority === col.key);
            return (
              <div key={col.key}>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {col.label}
                </p>
                <div className="mt-2 flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
                  {items.length === 0 && <p className="text-xs text-ink-soft">Nothing here.</p>}
                  {items.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-raised px-2.5 py-2"
                    >
                      <form action={toggleTaskStatus} className="contents">
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="revalidatePath" value="/" />
                        <TaskCheckbox defaultChecked={task.status === "done"} />
                      </form>
                      <span
                        className={`flex-1 truncate text-sm ${
                          task.status === "done" ? "text-ink-soft line-through" : "text-ink"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
