import { Trash2 } from "lucide-react";
import { createTopic, toggleTopicStatus, deleteTopic } from "@/lib/actions/course-topics";
import { TaskCheckbox } from "@/components/task-checkbox";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton } from "@/components/submit-button";
import type { CourseTopic } from "@/lib/types";

export function TopicsTab({ courseId, topics }: { courseId: string; topics: CourseTopic[] }) {
  const sorted = [...topics].sort((a, b) => a.order_index - b.order_index);
  const done = sorted.filter((t) => t.status === "done").length;

  return (
    <div>
      <p className="text-sm text-ink-soft">
        Break the syllabus into chapters or units to see how far you&apos;ve actually gotten.
      </p>

      <form action={createTopic} className="mt-4 flex items-center gap-2">
        <input type="hidden" name="courseId" value={courseId} />
        <input
          type="text"
          name="title"
          placeholder="Add a topic or chapter…"
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

      {sorted.length > 0 && (
        <p className="mt-4 text-xs font-medium text-ink-soft">
          {done} of {sorted.length} done
        </p>
      )}

      <div className="mt-2 flex max-h-[32rem] flex-col gap-1.5 overflow-y-auto pr-1">
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-soft">No topics added yet.</p>
        )}
        {sorted.map((topic) => (
          <div
            key={topic.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-raised px-3 py-2.5"
          >
            <form action={toggleTopicStatus} className="contents">
              <input type="hidden" name="topicId" value={topic.id} />
              <input type="hidden" name="courseId" value={courseId} />
              <TaskCheckbox defaultChecked={topic.status === "done"} />
            </form>
            <span
              className={`flex-1 text-sm ${
                topic.status === "done" ? "text-ink-soft line-through" : "text-ink"
              }`}
            >
              {topic.title}
            </span>
            <form action={deleteTopic}>
              <input type="hidden" name="topicId" value={topic.id} />
              <input type="hidden" name="courseId" value={courseId} />
              <ConfirmSubmitButton
                confirmMessage="Delete this topic?"
                aria-label="Delete topic"
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
