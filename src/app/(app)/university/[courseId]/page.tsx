import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CourseTabs } from "@/components/university/course-tabs";
import { TasksTab } from "@/components/university/tasks-tab";
import { AssessmentsTab } from "@/components/university/assessments-tab";
import { TopicsTab } from "@/components/university/topics-tab";
import { NotesScheduleTab } from "@/components/university/notes-schedule-tab";
import type { Assessment, ClassSlot, Course, CourseTopic, Note, Task } from "@/lib/types";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const [{ data: course }, { data: tasks }, { data: assessments }, { data: topics }, { data: notes }, { data: schedule }] =
    await Promise.all([
      supabase.from("courses").select("*").eq("id", courseId).maybeSingle(),
      supabase.from("tasks").select("*").eq("course_id", courseId).order("created_at"),
      supabase.from("assessments").select("*").eq("course_id", courseId).order("created_at"),
      supabase.from("course_topics").select("*").eq("course_id", courseId).order("order_index"),
      supabase
        .from("notes")
        .select("*")
        .eq("owner_type", "course")
        .eq("owner_id", courseId)
        .order("created_at", { ascending: false }),
      supabase.from("class_schedule").select("*").eq("course_id", courseId),
    ]);

  if (!course) notFound();

  const topicList = (topics ?? []) as CourseTopic[];
  const progress =
    topicList.length > 0
      ? Math.round((topicList.filter((t) => t.status === "done").length / topicList.length) * 100)
      : 0;

  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/university"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-accent"
        >
          <ArrowLeft size={15} /> University
        </Link>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ background: (course as Course).color }}
            />
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">
                {(course as Course).name}
              </h1>
              <p className="mt-0.5 text-sm text-ink-soft">
                {[
                  (course as Course).code,
                  (course as Course).credit_hours ? `${(course as Course).credit_hours} credits` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "No details yet"}
              </p>
            </div>
          </div>
          <Link
            href={`/university/${courseId}/edit`}
            aria-label="Edit course"
            className="shrink-0 rounded-md p-2 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
          >
            <Pencil size={16} />
          </Link>
        </div>

        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-accent-soft">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: (course as Course).color }}
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-soft">{progress}% through topics</p>
        </div>

        <div className="mt-8">
          <CourseTabs
            tasks={<TasksTab courseId={courseId} tasks={(tasks ?? []) as Task[]} />}
            assessments={
              <AssessmentsTab courseId={courseId} assessments={(assessments ?? []) as Assessment[]} />
            }
            topics={<TopicsTab courseId={courseId} topics={topicList} />}
            notesSchedule={
              <NotesScheduleTab
                courseId={courseId}
                notes={(notes ?? []) as Note[]}
                schedule={(schedule ?? []) as ClassSlot[]}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
