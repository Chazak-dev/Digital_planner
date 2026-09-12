import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MonthNav({
  label,
  prevHref,
  nextHref,
  thisMonthHref,
  isThisMonth,
}: {
  label: string;
  prevHref: string;
  nextHref: string;
  thisMonthHref: string;
  isThisMonth: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={prevHref}
        aria-label="Previous month"
        className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
      >
        <ChevronLeft size={18} />
      </Link>
      <h1 className="min-w-[10rem] text-center font-display text-xl font-semibold text-ink">
        {label}
      </h1>
      <Link
        href={nextHref}
        aria-label="Next month"
        className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
      >
        <ChevronRight size={18} />
      </Link>
      {!isThisMonth && (
        <Link
          href={thisMonthHref}
          className="ml-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          This month
        </Link>
      )}
    </div>
  );
}
