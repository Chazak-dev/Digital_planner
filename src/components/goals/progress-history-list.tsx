import type { ProgressHistoryEntry } from "@/lib/types";

export function ProgressHistoryList({ entries }: { entries: ProgressHistoryEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-base font-semibold text-ink">Progress history</h2>
      <div className="mt-3 flex flex-col gap-1.5">
        {entries.slice(0, 6).map((e) => (
          <div key={e.id} className="flex items-center gap-3 text-sm">
            <span className="w-10 shrink-0 font-medium text-ink">{e.percent}%</span>
            <span className="text-ink-soft">
              {new Date(e.recorded_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            {e.note && <span className="text-ink-soft">— {e.note}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
