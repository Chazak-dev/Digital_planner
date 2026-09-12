import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function WeekNav({
  label,
  prevHref,
  nextHref,
  thisWeekHref,
  isThisWeek,
}: {
  label: string;
  prevHref: string;
  nextHref: string;
  thisWeekHref: string;
  isThisWeek: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={prevHref}
        aria-label="Previous week"
        className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
      >
        <ChevronLeft size={18} />
      </Link>
      <h1 className="min-w-[13rem] text-center font-display text-xl font-semibold text-ink">
        {label}
      </h1>
      <Link
        href={nextHref}
        aria-label="Next week"
        className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
      >
        <ChevronRight size={18} />
      </Link>
      {!isThisWeek && (
        <Link
          href={thisWeekHref}
          className="ml-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          This week
        </Link>
      )}
    </div>
  );
}
