import { Check, Trash2 } from "lucide-react";
import { createAssessment, updateAssessment, deleteAssessment } from "@/lib/actions/assessments";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton, SubmitIconButton } from "@/components/submit-button";
import type { Assessment } from "@/lib/types";

const TYPE_LABEL: Record<Assessment["type"], string> = {
  assignment: "Assignment",
  project: "Project",
  exam: "Exam",
  quiz: "Quiz",
};

function splitDueDate(dueDate: string | null) {
  if (!dueDate) return { date: "", time: "" };
  const [date, timeRaw] = dueDate.split("T");
  const time = timeRaw && timeRaw !== "00:00:00" ? timeRaw.slice(0, 5) : "";
  return { date, time };
}

export function AssessmentsTab({
  courseId,
  assessments,
}: {
  courseId: string;
  assessments: Assessment[];
}) {
  const sorted = [...assessments].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });

  return (
    <div>
      <p className="text-sm text-ink-soft">Assignments, projects, exams, and quizzes — with grades once they&apos;re in.</p>

      <form action={createAssessment} className="mt-4 flex flex-wrap items-center gap-2">
        <input type="hidden" name="courseId" value={courseId} />
        <select
          name="type"
          defaultValue="assignment"
          className="rounded-lg border border-border bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="assignment">Assignment</option>
          <option value="project">Project</option>
          <option value="exam">Exam</option>
          <option value="quiz">Quiz</option>
        </select>
        <input
          type="text"
          name="title"
          placeholder="Title…"
          required
          className="min-w-0 flex-1 rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <input
          type="date"
          name="dueDate"
          className="rounded-lg border border-border bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <input
          type="time"
          name="dueTime"
          title="Due time (optional)"
          className="rounded-lg border border-border bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <SubmitButton
          pendingText="Adding…"
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Add
        </SubmitButton>
      </form>
      <p className="mt-1.5 text-xs text-ink-soft">Time is optional — leave it blank for a plain due date.</p>

      <div className="mt-5 flex max-h-[32rem] flex-col gap-1.5 overflow-y-auto pr-1">
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-soft">Nothing tracked yet.</p>
        )}
        {sorted.map((a) => {
          const { date, time } = splitDueDate(a.due_date);
          return (
            <form
              key={a.id}
              action={updateAssessment}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-raised px-3 py-2.5"
            >
              <input type="hidden" name="assessmentId" value={a.id} />
              <input type="hidden" name="courseId" value={courseId} />

              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-accent">
                {TYPE_LABEL[a.type]}
              </span>
              <span className="min-w-[8rem] flex-1 text-sm text-ink">{a.title}</span>

              <input
                type="date"
                name="dueDate"
                defaultValue={date}
                className="rounded-md border border-border bg-paper px-2 py-1 text-xs text-ink outline-none"
              />
              <input
                type="time"
                name="dueTime"
                defaultValue={time}
                title="Due time (optional)"
                className="w-24 rounded-md border border-border bg-paper px-2 py-1 text-xs text-ink outline-none"
              />

              <select
                name="status"
                defaultValue={a.status}
                className="rounded-md border border-border bg-paper px-2 py-1 text-xs text-ink outline-none"
              >
                <option value="upcoming">Upcoming</option>
                <option value="in_progress">In progress</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>

              <input
                type="number"
                name="gradeEarned"
                defaultValue={a.grade_earned ?? ""}
                placeholder="Grade"
                className="w-16 rounded-md border border-border bg-paper px-2 py-1 text-xs text-ink outline-none"
              />
              <span className="text-xs text-ink-soft">/</span>
              <input
                type="number"
                name="gradePossible"
                defaultValue={a.grade_possible ?? ""}
                placeholder="Max"
                className="w-16 rounded-md border border-border bg-paper px-2 py-1 text-xs text-ink outline-none"
              />

              <SubmitIconButton
                aria-label="Save"
                className="rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
              >
                <Check size={14} />
              </SubmitIconButton>
              <ConfirmSubmitButton
                confirmMessage="Delete this assessment?"
                formAction={deleteAssessment}
                aria-label="Delete assessment"
                className="rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
              >
                <Trash2 size={14} />
              </ConfirmSubmitButton>
            </form>
          );
        })}
      </div>
    </div>
  );
}
