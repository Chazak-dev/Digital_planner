import { toggleTaskStatus } from "@/lib/actions/tasks";
import { TaskCheckbox } from "@/components/task-checkbox";
import type { Task } from "@/lib/types";

export function RecentCompletedList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="rounded-xl border border-border bg-raised p-4">
      <h2 className="font-display text-base font-semibold text-ink">Recently completed</h2>
      {tasks.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">Nothing checked off yet.</p>
      ) : (
        <div className="mt-3 flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2.5">
              <form action={toggleTaskStatus} className="contents">
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="revalidatePath" value="/" />
                <TaskCheckbox defaultChecked />
              </form>
              <span className="min-w-0 flex-1 truncate text-sm text-ink-soft line-through">
                {task.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
