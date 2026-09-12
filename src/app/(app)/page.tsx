import { createClient } from "@/lib/supabase/server";
import { QuickAddForm } from "@/components/dashboard/quick-add-form";
import { MotivationalBanner } from "@/components/dashboard/motivational-banner";
import { PrioritiesBoard } from "@/components/dashboard/priorities-board";
import { WeekStrip } from "@/components/dashboard/week-strip";
import { DeadlineList } from "@/components/dashboard/deadline-list";
import { GoalMiniCards } from "@/components/dashboard/goal-mini-cards";
import { RecentCompletedList } from "@/components/dashboard/recent-completed-list";
import { formatDateTime, type DateFormat, type TimeFormat } from "@/lib/format-date";
import type { Goal, Task } from "@/lib/types";

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function greetingForHour(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function Home() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, show_motivational_message, week_start_day, date_format, time_format, dashboard_widgets")
    .eq("id", auth.user.id)
    .maybeSingle();

  const dateFormat = (profile?.date_format as DateFormat) ?? "MM/DD/YYYY";
  const timeFormat = (profile?.time_format as TimeFormat) ?? "12h";
  const widgets = (profile?.dashboard_widgets as Record<string, boolean> | null) ?? {
    priorities: true,
    week: true,
    deadlines: true,
    goals: true,
    completed: true,
  };

  const today = new Date();
  const todayStr = toISODate(today);
  const in14 = toISODate(new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000));

  const weekStartDay = profile?.week_start_day ?? 1;
  const diff = (today.getDay() - weekStartDay + 7) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - diff);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return toISODate(d);
  });
  const weekEndStr = weekDates[6];

  const [
    { data: todayTasks },
    { data: upcomingAssessments },
    { data: activeGoals },
    { data: recentCompleted },
    { data: weekTasks },
    { data: weekAssessments },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", auth.user.id)
      .not("status", "in", "(done,cancelled,skipped)")
      .or(`scheduled_date.lte.${todayStr},due_date.lte.${todayStr}`),
    supabase
      .from("assessments")
      .select("id, title, due_date, course_id, courses(name, color)")
      .gte("due_date", todayStr)
      .lt("due_date", `${in14}T23:59:59`)
      .neq("status", "graded")
      .order("due_date", { ascending: true })
      .limit(6),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", auth.user.id)
      .neq("status", "completed")
      .order("created_at", { ascending: true })
      .limit(6),
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("status", "done")
      .order("completed_at", { ascending: false })
      .limit(5),
    supabase
      .from("tasks")
      .select("scheduled_date")
      .eq("user_id", auth.user.id)
      .gte("scheduled_date", weekDates[0])
      .lte("scheduled_date", weekEndStr),
    supabase
      .from("assessments")
      .select("due_date")
      .gte("due_date", weekDates[0])
      .lt("due_date", `${weekEndStr}T23:59:59`),
  ]);

  const busyDays = new Set<string>();
  for (const t of weekTasks ?? []) if (t.scheduled_date) busyDays.add(t.scheduled_date);
  for (const a of weekAssessments ?? []) if (a.due_date) busyDays.add(a.due_date.slice(0, 10));

  const weekStripDays = weekDates.map((date) => ({
    date,
    dayOfWeek: new Date(date + "T00:00:00").getDay(),
    isToday: date === todayStr,
    hasItems: busyDays.has(date),
  }));

  type AssessmentWithCourse = {
    id: string;
    title: string;
    due_date: string;
    course_id: string;
    courses: { name: string; color: string } | null;
  };
  const deadlineItems = ((upcomingAssessments ?? []) as unknown as AssessmentWithCourse[]).map((a) => ({
    id: a.id,
    title: a.title,
    due_date: formatDateTime(a.due_date, dateFormat, timeFormat),
    courseId: a.course_id,
    courseName: a.courses?.name ?? "",
    courseColor: a.courses?.color ?? "#c96a87",
  }));

  const name = profile?.display_name || auth.user.email;

  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {greetingForHour(today.getHours())}
          {name ? `, ${name}` : ""}
        </h1>
        {profile?.show_motivational_message !== false && <MotivationalBanner />}

        <div className="mt-5">
          <QuickAddForm />
        </div>

        {(widgets.priorities !== false || widgets.week !== false) && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {widgets.priorities !== false && (
              <div className="lg:col-span-2">
                <PrioritiesBoard tasks={(todayTasks ?? []) as Task[]} />
              </div>
            )}
            {widgets.week !== false && <WeekStrip days={weekStripDays} />}
          </div>
        )}

        {(widgets.deadlines !== false || widgets.goals !== false || widgets.completed !== false) && (
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {widgets.deadlines !== false && <DeadlineList items={deadlineItems} />}
            {widgets.goals !== false && <GoalMiniCards goals={(activeGoals ?? []) as Goal[]} />}
            {widgets.completed !== false && (
              <RecentCompletedList tasks={(recentCompleted ?? []) as Task[]} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
