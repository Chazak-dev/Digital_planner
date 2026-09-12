import { toggleTaskStatus } from "@/lib/actions/tasks";
import { TaskCheckbox } from "@/components/task-checkbox";
import type { Task } from "@/lib/types";

export function CompletedToday({ tasks, revalidatePath }: { tasks: Task[]; revalidatePath: string }) {
  if (tasks.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Completed</p>
      <div className="mt-2 flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2.5">
            <form action={toggleTaskStatus} className="contents">
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="revalidatePath" value={revalidatePath} />
              <TaskCheckbox defaultChecked />
            </form>
            <span className="text-sm text-ink-soft line-through">{task.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
