"use client";

import { useState, useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { NAV_ITEMS, orderNavItems } from "@/lib/nav-items";
import { updateNavOrder } from "@/lib/actions/settings";

export function NavOrderEditor({ initialOrder }: { initialOrder: string[] | null }) {
  const [items, setItems] = useState(() => orderNavItems(initialOrder));
  const [isPending, startTransition] = useTransition();

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    startTransition(() => {
      void updateNavOrder(next.map((i) => i.href));
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <div
          key={item.href}
          className="flex items-center gap-3 rounded-lg border border-border bg-paper px-3 py-2"
        >
          <item.icon size={16} className="shrink-0 text-ink-soft" />
          <span className="flex-1 text-sm text-ink">{item.label}</span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Move up"
              disabled={i === 0 || isPending}
              onClick={() => move(i, -1)}
              className="rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent disabled:opacity-30"
            >
              <ChevronUp size={15} />
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={i === items.length - 1 || isPending}
              onClick={() => move(i, 1)}
              className="rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent disabled:opacity-30"
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </div>
      ))}
      <p className="mt-1 text-xs text-ink-soft">
        Changes save automatically. This reorders the sidebar — {NAV_ITEMS.filter((i) => i.primary).length}{" "}
        core pages stay put on the phone&apos;s bottom bar, but move within the &quot;More&quot; sheet there.
      </p>
    </div>
  );
}
