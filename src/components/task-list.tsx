"use client";

import { useState } from "react";
import { createTask } from "@/lib/actions/tasks";
import { SubmitButton } from "@/components/submit-button";
import { TaskRow } from "@/components/task-row";
import type { Task } from "@/lib/types";

type Filter = "all" | "open" | "done";

/** Generic task list + quick-add, shared by University (course tasks) and Goals (goal tasks). */
export function TaskList({
  tasks,
  hiddenFields,
  revalidatePath,
  helperText,
  emptyMessage = "No tasks yet.",
}: {
  tasks: Task[];
  hiddenFields: Record<string, string>;
  revalidatePath: string;
  helperText?: string;
  emptyMessage?: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const topLevel = tasks.filter((t) => !t.parent_task_id);
  const subtasksByParent = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.parent_task_id) continue;
    const list = subtasksByParent.get(t.parent_task_id) ?? [];
    list.push(t);
    subtasksByParent.set(t.parent_task_id, list);
  }

  const open = topLevel.filter((t) => t.status !== "done");
  const done = topLevel.filter((t) => t.status === "done");
  const base = filter === "open" ? open : filter === "done" ? done : [...open, ...done];
  const visible = query.trim()
    ? base.filter((t) => t.title.toLowerCase().includes(query.trim().toLowerCase()))
    : base;

  return (
    <div>
      {helperText && <p className="text-sm text-ink-soft">{helperText}</p>}

      <form action={createTask} className={`flex flex-wrap items-center gap-2 ${helperText ? "mt-4" : ""}`}>
        {Object.entries(hiddenFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <input type="hidden" name="revalidatePath" value={revalidatePath} />
        <input
          type="text"
          name="title"
          placeholder="Add a task…"
          required
          className="min-w-0 flex-1 rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <input
          type="date"
          name="scheduledDate"
          className="rounded-lg border border-border bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <select
          name="priority"
          defaultValue="should"
          className="rounded-lg border border-border bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
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

      {topLevel.length > 3 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-accent-soft p-1">
            {(["all", "open", "done"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  filter === f ? "bg-raised text-accent shadow-sm" : "text-ink-soft"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title…"
            className="min-w-0 flex-1 rounded-lg border border-border bg-paper px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
          />
        </div>
      )}

      <p className="mt-2 text-xs text-ink-soft">Click a task to add details or subtasks.</p>

      <div className="mt-3 flex max-h-[32rem] flex-col gap-1.5 overflow-y-auto pr-1">
        {visible.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-soft">
            {topLevel.length === 0 ? emptyMessage : "No tasks match."}
          </p>
        )}
        {visible.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            subtasks={subtasksByParent.get(task.id) ?? []}
            hiddenFields={hiddenFields}
            revalidatePath={revalidatePath}
          />
        ))}
      </div>
    </div>
  );
}
