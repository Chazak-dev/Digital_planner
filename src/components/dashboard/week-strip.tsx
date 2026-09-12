const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function WeekStrip({
  days,
}: {
  days: { date: string; dayOfWeek: number; isToday: boolean; hasItems: boolean }[];
}) {
  return (
    <div>
      <h2 className="font-display text-base font-semibold text-ink">This week</h2>
      <div className="mt-3 flex justify-between gap-1">
        {days.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase text-ink-soft">
              {DAY_LABELS[day.dayOfWeek]}
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                day.isToday ? "bg-accent text-white" : "text-ink"
              }`}
            >
              {Number(day.date.slice(-2))}
            </div>
            <span
              className={`h-1.5 w-1.5 rounded-full ${day.hasItems ? "bg-accent" : "bg-transparent"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
