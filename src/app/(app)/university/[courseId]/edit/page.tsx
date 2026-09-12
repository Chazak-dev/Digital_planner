import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateCourse, deleteCourse, setCourseArchived } from "@/lib/actions/courses";
import { ColorPicker } from "@/components/color-picker";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton } from "@/components/submit-button";
import type { Course } from "@/lib/types";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).maybeSingle();

  if (!course) notFound();
  const c = course as Course;

  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-md">
        <Link
          href={`/university/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-accent"
        >
          <ArrowLeft size={15} /> {c.name}
        </Link>

        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Edit course</h1>

        <form action={updateCourse} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="courseId" value={courseId} />

          <label className="flex flex-col gap-1 text-sm text-ink">
            Course name
            <input
              type="text"
              name="name"
              required
              defaultValue={c.name}
              className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Course code
            <input
              type="text"
              name="code"
              defaultValue={c.code ?? ""}
              className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <div className="flex flex-col gap-1.5 text-sm text-ink">
            Color
            <ColorPicker name="color" defaultValue={c.color} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Term starts
              <input
                type="date"
                name="termStart"
                defaultValue={c.term_start ?? ""}
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Term ends
              <input
                type="date"
                name="termEnd"
                defaultValue={c.term_end ?? ""}
                className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Credit hours
            <input
              type="number"
              step="0.5"
              name="creditHours"
              defaultValue={c.credit_hours ?? ""}
              className="w-28 rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <SubmitButton
            pendingText="Saving…"
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save changes
          </SubmitButton>
        </form>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
          <form action={setCourseArchived}>
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="archived" value={c.archived ? "false" : "true"} />
            <SubmitButton
              pendingText={c.archived ? "Unarchiving…" : "Archiving…"}
              className="flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-accent"
            >
              {c.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
              {c.archived ? "Unarchive course" : "Archive course"}
            </SubmitButton>
          </form>
          <p className="text-xs text-ink-soft">
            Archiving hides a finished course from University without deleting anything — everything
            comes back if you unarchive it.
          </p>

          <form action={deleteCourse} className="mt-2">
            <input type="hidden" name="courseId" value={courseId} />
            <ConfirmSubmitButton
              confirmMessage={`Delete "${c.name}"? This removes its topics, assessments, class schedule, and notes. Tasks you made for it stay, just unlinked.`}
              className="flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-accent"
            >
              <Trash2 size={15} /> Delete course
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
