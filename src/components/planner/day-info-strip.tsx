import Link from "next/link";
import { GraduationCap, CalendarClock } from "lucide-react";

type ClassItem = { id: string; courseId: string; courseName: string; courseColor: string; startTime: string; endTime: string; location: string | null };
type DeadlineItem = {
  id: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  title: string;
  time?: string | null;
};

export function DayInfoStrip({ classes, deadlines }: { classes: ClassItem[]; deadlines: DeadlineItem[] }) {
  if (classes.length === 0 && deadlines.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {classes.map((c) => (
        <Link key={c.id} href={`/university/${c.courseId}`} className="flex items-center gap-2 text-sm">
          <GraduationCap size={14} className="shrink-0 text-ink-soft" />
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.courseColor }} />
          <span className="text-ink">{c.courseName}</span>
          <span className="text-ink-soft">
            {c.startTime.slice(0, 5)}–{c.endTime.slice(0, 5)}
            {c.location ? ` · ${c.location}` : ""}
          </span>
        </Link>
      ))}
      {deadlines.map((d) => (
        <Link key={d.id} href={`/university/${d.courseId}`} className="flex items-center gap-2 text-sm">
          <CalendarClock size={14} className="shrink-0 text-ink-soft" />
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.courseColor }} />
          <span className="text-ink">{d.title}</span>
          <span className="text-ink-soft">{d.time ? `due ${d.time}` : "due today"}</span>
        </Link>
      ))}
    </div>
  );
}
