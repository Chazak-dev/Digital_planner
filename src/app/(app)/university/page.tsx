import Link from "next/link";
import { Plus, GraduationCap, ArchiveRestore } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { setCourseArchived } from "@/lib/actions/courses";
import { SubmitButton } from "@/components/submit-button";

export default async function UniversityPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, code, color, archived")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: true });

  const activeCourses = (courses ?? []).filter((c) => !c.archived);
  const archivedCourses = (courses ?? []).filter((c) => c.archived);
  const courseIds = activeCourses.map((c) => c.id);

  const progressByCourse = new Map<string, number>();
  if (courseIds.length > 0) {
    const { data: topics } = await supabase
      .from("course_topics")
      .select("course_id, status")
      .in("course_id", courseIds);

    const totals = new Map<string, { total: number; done: number }>();
    for (const t of topics ?? []) {
      const entry = totals.get(t.course_id) ?? { total: 0, done: 0 };
      entry.total += 1;
      if (t.status === "done") entry.done += 1;
      totals.set(t.course_id, entry);
    }
    for (const [id, { total, done }] of totals) {
      progressByCourse.set(id, total > 0 ? Math.round((done / total) * 100) : 0);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">University</h1>
            <p className="mt-1 text-sm text-ink-soft">Your courses, each with its own space.</p>
          </div>
          <Link
            href="/university/new"
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} /> Add course
          </Link>
        </div>

        {activeCourses.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-raised px-6 py-16 text-center">
            <GraduationCap className="text-ink-soft" size={28} />
            <p className="mt-3 text-sm font-medium text-ink">No courses yet</p>
            <p className="mt-1 max-w-xs text-sm text-ink-soft">
              Add your first course to start tracking assignments, study sessions, and progress.
            </p>
            <Link
              href="/university/new"
              className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Add a course
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {activeCourses.map((course) => {
              const progress = progressByCourse.get(course.id) ?? 0;
              return (
                <Link
                  key={course.id}
                  href={`/university/${course.id}`}
                  className="rounded-xl border border-border bg-raised p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: course.color }}
                    />
                    <span className="truncate font-medium text-ink">{course.name}</span>
                  </div>
                  {course.code && <p className="mt-1 text-xs text-ink-soft">{course.code}</p>}
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-accent-soft">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, background: course.color }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-ink-soft">{progress}% through topics</p>
                </Link>
              );
            })}
          </div>
        )}

        {archivedCourses.length > 0 && (
          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Archived</p>
            <div className="mt-3 flex flex-col gap-1.5">
              {archivedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-raised px-3 py-2 opacity-70"
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: course.color }} />
                  <Link href={`/university/${course.id}`} className="flex-1 truncate text-sm text-ink hover:text-accent">
                    {course.name}
                  </Link>
                  <form action={setCourseArchived}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="archived" value="false" />
                    <SubmitButton
                      pendingText="Unarchiving…"
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                    >
                      <ArchiveRestore size={13} /> Unarchive
                    </SubmitButton>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
