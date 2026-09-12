import { TaskList } from "@/components/task-list";
import type { Task } from "@/lib/types";

export function TasksTab({ courseId, tasks }: { courseId: string; tasks: Task[] }) {
  return (
    <TaskList
      tasks={tasks}
      hiddenFields={{ area: "university", courseId }}
      revalidatePath={`/university/${courseId}`}
      helperText="Anything you want to do for this course that isn't a graded assessment — extra practice, review sessions, whatever helps."
      emptyMessage="No tasks for this course yet."
    />
  );
}
