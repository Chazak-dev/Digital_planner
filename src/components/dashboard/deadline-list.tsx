import Link from "next/link";
import { CalendarClock } from "lucide-react";

type DeadlineItem = {
  id: string;
  title: string;
  due_date: string;
  courseId: string;
  courseName: string;
  courseColor: string;
};

export function DeadlineList({ items }: { items: DeadlineItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-raised p-4">
      <h2 className="font-display text-base font-semibold text-ink">Upcoming deadlines</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">Nothing due in the next two weeks.</p>
      ) : (
        <div className="mt-3 flex max-h-56 flex-col gap-2.5 overflow-y-auto pr-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/university/${item.courseId}`}
              className="flex items-center gap-2 text-sm"
            >
              <CalendarClock size={14} className="shrink-0 text-ink-soft" />
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: item.courseColor }}
              />
              <span className="min-w-0 flex-1 truncate text-ink">{item.title}</span>
              <span className="shrink-0 text-xs text-ink-soft">{item.due_date}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
