import { Inbox as InboxIcon, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createTask, toggleTaskStatus, deleteTask, organizeInboxTask } from "@/lib/actions/tasks";
import { TaskCheckbox } from "@/components/task-checkbox";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton } from "@/components/submit-button";
import type { Task } from "@/lib/types";

export default async function InboxPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [{ data: tasks }, { data: courses }, { data: goals }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("status", "inbox")
      .order("created_at", { ascending: false }),
    supabase.from("courses").select("id, name, color").eq("user_id", auth.user.id).eq("archived", false),
    supabase.from("goals").select("id, title, color").eq("user_id", auth.user.id).neq("status", "completed"),
  ]);

  const inboxTasks = (tasks ?? []) as Task[];
  const revalidatePath = "/inbox";

  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="font-display text-2xl font-semibold text-ink">Task Inbox</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Anything you&apos;ve captured but haven&apos;t organized yet — give it a course, a goal, or
          a date, and it moves out of here.
        </p>

        <form action={createTask} className="mt-5 flex items-center gap-2">
          <input type="hidden" name="area" value="personal" />
          <input type="hidden" name="revalidatePath" value={revalidatePath} />
          <input
            type="text"
            name="title"
            placeholder="Capture something…"
            required
            className="min-w-0 flex-1 rounded-lg border border-border bg-raised px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
          <SubmitButton
            pendingText="Adding…"
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Add
          </SubmitButton>
        </form>

        {inboxTasks.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-raised px-6 py-16 text-center">
            <InboxIcon className="text-ink-soft" size={28} />
            <p className="mt-3 text-sm font-medium text-ink">Inbox zero</p>
            <p className="mt-1 max-w-xs text-sm text-ink-soft">
              Anything you add without a course, goal, or date lands here.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            {inboxTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-border bg-raised p-3">
                <div className="flex items-center gap-2.5">
                  <form action={toggleTaskStatus} className="contents">
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="revalidatePath" value={revalidatePath} />
                    <TaskCheckbox defaultChecked={false} />
                  </form>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{task.title}</span>
                  <form action={deleteTask}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="revalidatePath" value={revalidatePath} />
                    <ConfirmSubmitButton
                      confirmMessage="Delete this task?"
                      aria-label="Delete task"
                      className="rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                    >
                      <Trash2 size={14} />
                    </ConfirmSubmitButton>
                  </form>
                </div>

                <form
                  action={organizeInboxTask}
                  className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border pt-2.5"
                >
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="revalidatePath" value={revalidatePath} />
                  <select
                    name="courseId"
                    defaultValue=""
                    className="rounded-lg border border-border bg-paper px-2 py-1.5 text-xs text-ink outline-none focus:border-accent"
                  >
                    <option value="">Course…</option>
                    {(courses ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-ink-soft">or</span>
                  <select
                    name="goalId"
                    defaultValue=""
                    className="rounded-lg border border-border bg-paper px-2 py-1.5 text-xs text-ink outline-none focus:border-accent"
                  >
                    <option value="">Goal…</option>
                    {(goals ?? []).map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-ink-soft">or just</span>
                  <input
                    type="date"
                    name="scheduledDate"
                    className="rounded-lg border border-border bg-paper px-2 py-1.5 text-xs text-ink outline-none focus:border-accent"
                  />
                  <SubmitButton
                    pendingText="Moving…"
                    className="ml-auto rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
                  >
                    Organize
                  </SubmitButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
