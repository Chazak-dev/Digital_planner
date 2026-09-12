import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createGoal } from "@/lib/actions/goals";
import { ColorPicker } from "@/components/color-picker";
import { SubmitButton } from "@/components/submit-button";

export default function NewGoalPage() {
  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/goals"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-accent"
        >
          <ArrowLeft size={15} /> Goals
        </Link>

        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">New goal</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Just the title is required — a deadline is optional, and progress starts at 0%.
        </p>

        <form action={createGoal} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink">
            Title
            <input
              type="text"
              name="title"
              required
              autoFocus
              className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Description <span className="text-ink-soft">(optional)</span>
            <textarea
              name="description"
              rows={2}
              className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Category
              <select
                name="category"
                defaultValue="other"
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              >
                <option value="career">Career</option>
                <option value="certification">Certification</option>
                <option value="skill">Skill</option>
                <option value="project">Project</option>
                <option value="health">Health</option>
                <option value="habit">Habit</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Priority
              <select
                name="priority"
                defaultValue="medium"
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Status
              <select
                name="status"
                defaultValue="active"
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              >
                <option value="flexible">Flexible</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Icon <span className="text-ink-soft">(emoji, optional)</span>
              <input
                type="text"
                name="icon"
                maxLength={4}
                placeholder="🎯"
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              />
            </label>
          </div>

          <div className="flex flex-col gap-1.5 text-sm text-ink">
            Color
            <ColorPicker name="color" />
          </div>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Deadline <span className="text-ink-soft">(optional)</span>
            <input
              type="date"
              name="deadline"
              className="w-48 rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <SubmitButton
            pendingText="Creating goal…"
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Create goal
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
