import Link from "next/link";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type MonthDay = {
  date: string;
  dayOfWeek: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  dots: { id: string; title: string; color: string }[];
};

export function MonthGrid({ days, weekStartDay }: { days: MonthDay[]; weekStartDay: number }) {
  const orderedLabels = [...DAY_LABELS.slice(weekStartDay), ...DAY_LABELS.slice(0, weekStartDay)];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {orderedLabels.map((label) => (
          <p key={label} className="text-center text-[11px] font-semibold uppercase text-ink-soft">
            {label}
          </p>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const visible = day.dots.slice(0, 4);
          const extra = day.dots.length - visible.length;
          return (
            <Link
              key={day.date}
              href={`/planner?view=day&date=${day.date}`}
              className={`flex min-h-[4.5rem] flex-col gap-1 rounded-lg border p-1.5 transition-colors sm:min-h-[5.5rem] ${
                day.isToday
                  ? "border-accent bg-accent-soft/40"
                  : day.isCurrentMonth
                    ? "border-border bg-raised hover:border-accent"
                    : "border-transparent bg-transparent opacity-40"
              }`}
            >
              <span
                className={`text-xs font-medium ${day.isToday ? "text-accent" : "text-ink"}`}
              >
                {Number(day.date.slice(-2))}
              </span>
              <div className="flex flex-wrap gap-1">
                {visible.map((dot) => (
                  <span
                    key={dot.id}
                    title={dot.title}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: dot.color }}
                  />
                ))}
                {extra > 0 && <span className="text-[10px] text-ink-soft">+{extra}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
