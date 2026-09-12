import Link from "next/link";
import { Search, GraduationCap, Target, ListTodo } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type CourseHit = { id: string; name: string; code: string | null; color: string };
type GoalHit = { id: string; title: string; category: string; color: string; icon: string | null };
type TaskHit = { id: string; title: string; status: string; course_id: string | null; goal_id: string | null };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  let courses: CourseHit[] = [];
  let goals: GoalHit[] = [];
  let tasks: TaskHit[] = [];

  if (query) {
    const like = `%${query}%`;
    const [{ data: c }, { data: g }, { data: t }] = await Promise.all([
      supabase
        .from("courses")
        .select("id, name, code, color")
        .eq("user_id", auth.user.id)
        .ilike("name", like)
        .limit(10),
      supabase
        .from("goals")
        .select("id, title, category, color, icon")
        .eq("user_id", auth.user.id)
        .ilike("title", like)
        .limit(10),
      supabase
        .from("tasks")
        .select("id, title, status, course_id, goal_id")
        .eq("user_id", auth.user.id)
        .ilike("title", like)
        .limit(20),
    ]);
    courses = (c ?? []) as CourseHit[];
    goals = (g ?? []) as GoalHit[];
    tasks = (t ?? []) as TaskHit[];
  }

  const hasResults = courses.length > 0 || goals.length > 0 || tasks.length > 0;

  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-2xl">
        <form action="/search" className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Search courses, goals, tasks…"
            className="w-full rounded-xl border border-border bg-raised py-3 pl-10 pr-3 text-sm text-ink outline-none focus:border-accent"
          />
        </form>

        {!query && (
          <p className="mt-6 text-sm text-ink-soft">Search across your courses, goals, and tasks.</p>
        )}

        {query && !hasResults && (
          <p className="mt-6 text-sm text-ink-soft">Nothing matching &quot;{query}&quot;.</p>
        )}

        {courses.length > 0 && (
          <div className="mt-8">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <GraduationCap size={13} /> Courses
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/university/${c.id}`}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-raised px-3 py-2.5 text-sm"
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                  <span className="text-ink">{c.name}</span>
                  {c.code && <span className="text-xs text-ink-soft">{c.code}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {goals.length > 0 && (
          <div className="mt-8">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <Target size={13} /> Goals
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {goals.map((g) => (
                <Link
                  key={g.id}
                  href={`/goals/${g.id}`}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-raised px-3 py-2.5 text-sm"
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: g.color }} />
                  <span className="text-ink">
                    {g.icon ? `${g.icon} ` : ""}
                    {g.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="mt-8">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <ListTodo size={13} /> Tasks
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {tasks.map((t) => {
                const href = t.course_id
                  ? `/university/${t.course_id}`
                  : t.goal_id
                    ? `/goals/${t.goal_id}`
                    : "/planner";
                return (
                  <Link
                    key={t.id}
                    href={href}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-raised px-3 py-2.5 text-sm"
                  >
                    <span
                      className={t.status === "done" ? "text-ink-soft line-through" : "text-ink"}
                    >
                      {t.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
