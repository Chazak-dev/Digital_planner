import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCourse } from "@/lib/actions/courses";
import { ColorPicker } from "@/components/color-picker";
import { SubmitButton } from "@/components/submit-button";

export default function NewCoursePage() {
  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/university"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-accent"
        >
          <ArrowLeft size={15} /> University
        </Link>

        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Add a course</h1>
        <p className="mt-1 text-sm text-ink-soft">Just the name is required — add the rest whenever.</p>

        <form action={createCourse} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink">
            Course name
            <input
              type="text"
              name="name"
              required
              autoFocus
              className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Course code <span className="text-ink-soft">(optional)</span>
            <input
              type="text"
              name="code"
              placeholder="e.g. CS 201"
              className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <div className="flex flex-col gap-1.5 text-sm text-ink">
            Color
            <ColorPicker name="color" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Term starts <span className="text-ink-soft">(optional)</span>
              <input
                type="date"
                name="termStart"
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Term ends <span className="text-ink-soft">(optional)</span>
              <input
                type="date"
                name="termEnd"
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Credit hours <span className="text-ink-soft">(optional)</span>
            <input
              type="number"
              step="0.5"
              name="creditHours"
              className="w-28 rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <SubmitButton
            pendingText="Adding course…"
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Add course
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
