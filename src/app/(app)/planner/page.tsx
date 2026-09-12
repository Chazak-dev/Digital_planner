import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DateNav } from "@/components/planner/date-nav";
import { WeekNav } from "@/components/planner/week-nav";
import { DayInfoStrip } from "@/components/planner/day-info-strip";
import { CarriedOver } from "@/components/planner/carried-over";
import { DailyBoard } from "@/components/planner/daily-board";
import { CompletedToday } from "@/components/planner/completed-today";
import { WeekGrid, type WeekDay } from "@/components/planner/week-grid";
import { MonthNav } from "@/components/planner/month-nav";
import { MonthGrid, type MonthDay } from "@/components/planner/month-grid";
import { formatTime } from "@/lib/format-date";
import type { Task } from "@/lib/types";

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function formatDayLabel(dateStr: string, todayStr: string) {
  if (dateStr === todayStr) return "Today";
  const yesterday = addDays(todayStr, -1);
  const tomorrow = addDays(todayStr, 1);
  if (dateStr === yesterday) return "Yesterday";
  if (dateStr === tomorrow) return "Tomorrow";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatWeekLabel(weekDates: string[]) {
  const start = new Date(weekDates[0] + "T00:00:00");
  const end = new Date(weekDates[6] + "T00:00:00");
  const startStr = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString(undefined, {
    month: start.getMonth() === end.getMonth() ? undefined : "short",
    day: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

function ViewSwitcher({ view, dateParam }: { view: "day" | "week" | "month"; dateParam: string }) {
  const tabs: { key: "day" | "week" | "month"; label: string }[] = [
    { key: "day", label: "Day" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
  ];
  return (
    <div className="flex items-center gap-1 rounded-lg bg-accent-soft p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/planner?view=${tab.key}&date=${dateParam}`}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            view === tab.key ? "bg-raised text-accent shadow-sm" : "text-ink-soft hover:text-ink"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>;
}) {
  const { date, view: viewParam } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("week_start_day, default_daily_view, time_format")
    .eq("id", auth.user.id)
    .maybeSingle();
  const weekStartDay = profile?.week_start_day ?? 1;
  const timeFormat = profile?.time_format === "24h" ? "24h" : "12h";

  const todayStr = toISODate(new Date());
  const anchorDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayStr;
  const defaultView = profile?.default_daily_view === "week" || profile?.default_daily_view === "month"
    ? profile.default_daily_view
    : "day";
  const view = viewParam === "week" ? "week" : viewParam === "month" ? "month" : viewParam === "day" ? "day" : defaultView;
  const revalidatePath =
    view === "week" ? "/planner?view=week" : view === "month" ? "/planner?view=month" : "/planner";

  if (view === "month") {
    const [y, m] = anchorDate.split("-").map(Number);
    const monthFirst = new Date(y, m - 1, 1);
    const monthLast = new Date(y, m, 0);
    const monthLabel = monthFirst.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const isThisMonth = todayStr.slice(0, 7) === anchorDate.slice(0, 7);
    const prevMonthFirst = toISODate(new Date(y, m - 2, 1));
    const nextMonthFirst = toISODate(new Date(y, m, 1));

    const gridStartDiff = (monthFirst.getDay() - weekStartDay + 7) % 7;
    const gridStart = addDays(toISODate(monthFirst), -gridStartDiff);
    const gridEndDiff = (6 - ((monthLast.getDay() - weekStartDay + 7) % 7)) % 7;
    const gridEnd = addDays(toISODate(monthLast), gridEndDiff);

    const gridDates: string[] = [];
    for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) gridDates.push(d);

    const [{ data: scheduledTasks }, { data: dueTasks }, { data: monthClasses }, { data: monthAssessments }] =
      await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, scheduled_date, course_id, goal_id")
          .eq("user_id", auth.user.id)
          .not("status", "in", "(done,cancelled,skipped)")
          .gte("scheduled_date", gridStart)
          .lte("scheduled_date", gridEnd),
        supabase
          .from("tasks")
          .select("id, title, due_date, course_id, goal_id")
          .eq("user_id", auth.user.id)
          .not("status", "in", "(done,cancelled,skipped)")
          .is("scheduled_date", null)
          .gte("due_date", gridStart)
          .lte("due_date", gridEnd),
        supabase.from("class_schedule").select("id, day_of_week, courses(name, color)"),
        supabase
          .from("assessments")
          .select("id, title, due_date, courses(color)")
          .gte("due_date", gridStart)
          .lte("due_date", gridEnd)
          .neq("status", "graded"),
      ]);

    type ClassJoin = { id: string; day_of_week: number; courses: { name: string; color: string } | null };
    type AssessmentJoin = { id: string; title: string; due_date: string; courses: { color: string } | null };
    type ScheduledTaskJoin = {
      id: string;
      title: string;
      scheduled_date: string;
      course_id: string | null;
      goal_id: string | null;
    };
    type DueTaskJoin = {
      id: string;
      title: string;
      due_date: string;
      course_id: string | null;
      goal_id: string | null;
    };

    const days: MonthDay[] = gridDates.map((date) => {
      const dow = new Date(date + "T00:00:00").getDay();
      const dots: MonthDay["dots"] = [];

      for (const c of (monthClasses ?? []) as unknown as ClassJoin[]) {
        if (c.day_of_week === dow) {
          dots.push({ id: `c-${c.id}-${date}`, title: c.courses?.name ?? "Class", color: c.courses?.color ?? "#c96a87" });
        }
      }
      for (const a of (monthAssessments ?? []) as unknown as AssessmentJoin[]) {
        if (a.due_date.slice(0, 10) === date) {
          dots.push({ id: `a-${a.id}`, title: a.title, color: a.courses?.color ?? "#c96a87" });
        }
      }
      for (const t of (scheduledTasks ?? []) as unknown as ScheduledTaskJoin[]) {
        if (t.scheduled_date === date) {
          dots.push({ id: `t-${t.id}`, title: t.title, color: t.course_id || t.goal_id ? "#c96a87" : "#8c7581" });
        }
      }
      for (const t of (dueTasks ?? []) as unknown as DueTaskJoin[]) {
        if (t.due_date === date) {
          dots.push({ id: `td-${t.id}`, title: t.title, color: t.course_id || t.goal_id ? "#c96a87" : "#8c7581" });
        }
      }

      return {
        date,
        dayOfWeek: dow,
        isToday: date === todayStr,
        isCurrentMonth: date.slice(0, 7) === anchorDate.slice(0, 7),
        dots,
      };
    });

    return (
      <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MonthNav
              label={monthLabel}
              prevHref={`/planner?view=month&date=${prevMonthFirst}`}
              nextHref={`/planner?view=month&date=${nextMonthFirst}`}
              thisMonthHref="/planner?view=month"
              isThisMonth={isThisMonth}
            />
            <ViewSwitcher view="month" dateParam={anchorDate} />
          </div>

          <div className="mt-6">
            <MonthGrid days={days} weekStartDay={weekStartDay} />
          </div>

          <p className="mt-6 text-xs text-ink-soft">Click a day to open it in the daily planner.</p>
        </div>
      </div>
    );
  }

  if (view === "week") {
    const anchor = new Date(anchorDate + "T00:00:00");
    const diff = (anchor.getDay() - weekStartDay + 7) % 7;
    const weekStart = addDays(anchorDate, -diff);
    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const weekEnd = weekDates[6];
    const isThisWeek = weekDates.includes(todayStr);

    const [
      { data: scheduledTasks },
      { data: dueTasks },
      { data: weekClasses },
      { data: weekAssessments },
      { data: inboxTasks },
    ] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", auth.user.id)
        .not("status", "in", "(done,cancelled,skipped)")
        .gte("scheduled_date", weekStart)
        .lte("scheduled_date", weekEnd),
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", auth.user.id)
        .not("status", "in", "(done,cancelled,skipped)")
        .is("scheduled_date", null)
        .gte("due_date", weekStart)
        .lte("due_date", weekEnd),
      supabase.from("class_schedule").select("id, day_of_week"),
      supabase
        .from("assessments")
        .select("id, title, due_date, courses(color)")
        .gte("due_date", weekStart)
        .lte("due_date", weekEnd)
        .neq("status", "graded"),
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", auth.user.id)
        .eq("status", "inbox")
        .order("created_at", { ascending: false }),
    ]);

    type AssessmentRow = { id: string; title: string; due_date: string; courses: { color: string } | null };

    const weekTasks = [...((scheduledTasks ?? []) as Task[]), ...((dueTasks ?? []) as Task[])];

    const days: WeekDay[] = weekDates.map((date) => {
      const dayOfWeek = new Date(date + "T00:00:00").getDay();
      return {
        date,
        dayOfWeek,
        isToday: date === todayStr,
        classCount: (weekClasses ?? []).filter((c) => c.day_of_week === dayOfWeek).length,
        deadlines: ((weekAssessments ?? []) as unknown as AssessmentRow[])
          .filter((a) => a.due_date.slice(0, 10) === date)
          .map((a) => ({ id: a.id, title: a.title, color: a.courses?.color ?? "#c96a87" })),
        tasks: weekTasks.filter((t) => (t.scheduled_date ?? t.due_date) === date),
      };
    });

    return (
      <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <WeekNav
              label={formatWeekLabel(weekDates)}
              prevHref={`/planner?view=week&date=${addDays(weekStart, -7)}`}
              nextHref={`/planner?view=week&date=${addDays(weekStart, 7)}`}
              thisWeekHref="/planner?view=week"
              isThisWeek={isThisWeek}
            />
            <ViewSwitcher view="week" dateParam={anchorDate} />
          </div>

          <div className="mt-6">
            <WeekGrid days={days} inboxTasks={(inboxTasks ?? []) as Task[]} revalidatePath="/planner?view=week" />
          </div>

          <p className="mt-6 text-xs text-ink-soft">Click a day to open it in the daily planner.</p>
        </div>
      </div>
    );
  }

  // Day view
  const isToday = anchorDate === todayStr;
  const dayOfWeek = new Date(anchorDate + "T00:00:00").getDay();
  const nextDay = addDays(anchorDate, 1);

  const [
    { data: dayTasks },
    { data: overdueTasks },
    { data: classes },
    { data: dueToday },
    { data: completed },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", auth.user.id)
      .not("status", "in", "(done,cancelled,skipped)")
      .or(`scheduled_date.eq.${anchorDate},due_date.eq.${anchorDate}`),
    isToday
      ? supabase
          .from("tasks")
          .select("*")
          .eq("user_id", auth.user.id)
          .not("status", "in", "(done,cancelled,skipped)")
          .or(`scheduled_date.lt.${todayStr},due_date.lt.${todayStr}`)
      : Promise.resolve({ data: [] as Task[] }),
    supabase
      .from("class_schedule")
      .select("id, course_id, start_time, end_time, location, courses(name, color)")
      .eq("day_of_week", dayOfWeek),
    supabase
      .from("assessments")
      .select("id, title, due_date, course_id, courses(name, color)")
      .gte("due_date", `${anchorDate}T00:00:00`)
      .lt("due_date", `${nextDay}T00:00:00`)
      .neq("status", "graded"),
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("status", "done")
      .gte("completed_at", `${anchorDate}T00:00:00`)
      .lt("completed_at", `${nextDay}T00:00:00`),
  ]);

  type ClassRow = {
    id: string;
    course_id: string;
    start_time: string;
    end_time: string;
    location: string | null;
    courses: { name: string; color: string } | null;
  };
  type DeadlineRow = {
    id: string;
    title: string;
    due_date: string;
    course_id: string;
    courses: { name: string; color: string } | null;
  };

  const classItems = ((classes ?? []) as unknown as ClassRow[]).map((c) => ({
    id: c.id,
    courseId: c.course_id,
    courseName: c.courses?.name ?? "",
    courseColor: c.courses?.color ?? "#c96a87",
    startTime: c.start_time,
    endTime: c.end_time,
    location: c.location,
  }));

  const deadlineItems = ((dueToday ?? []) as unknown as DeadlineRow[]).map((d) => {
    const timePart = d.due_date.split("T")[1]?.slice(0, 5);
    return {
      id: d.id,
      courseId: d.course_id,
      courseName: d.courses?.name ?? "",
      courseColor: d.courses?.color ?? "#c96a87",
      title: d.title,
      time: timePart && timePart !== "00:00" ? formatTime(timePart, timeFormat) : null,
    };
  });

  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DateNav
            label={formatDayLabel(anchorDate, todayStr)}
            prevHref={`/planner?date=${addDays(anchorDate, -1)}`}
            nextHref={`/planner?date=${addDays(anchorDate, 1)}`}
            todayHref="/planner"
            isToday={isToday}
          />
          <ViewSwitcher view="day" dateParam={anchorDate} />
        </div>

        <div className="mt-4">
          <DayInfoStrip classes={classItems} deadlines={deadlineItems} />
        </div>

        {isToday && (
          <div className="mt-4">
            <CarriedOver
              tasks={(overdueTasks ?? []) as Task[]}
              todayStr={todayStr}
              revalidatePath={revalidatePath}
            />
          </div>
        )}

        <div className="mt-6">
          <DailyBoard tasks={(dayTasks ?? []) as Task[]} dateStr={anchorDate} revalidatePath={revalidatePath} />
        </div>

        <div className="mt-8">
          <CompletedToday tasks={(completed ?? []) as Task[]} revalidatePath={revalidatePath} />
        </div>
      </div>
    </div>
  );
}
