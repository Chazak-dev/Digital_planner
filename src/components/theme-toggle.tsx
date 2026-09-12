"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, type LucideIcon } from "lucide-react";
import { applyTheme, type Theme } from "@/lib/theme";
import { updateTheme } from "@/app/(app)/actions";

const OPTIONS: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: "system", label: "Match system", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    // First time on this device there's no theme cookie yet, so the server
    // rendered without one — adopt the account's saved preference and set
    // the cookie so the next load is right from the server, no flash.
    const current = document.documentElement.getAttribute("data-theme");
    const expected = initialTheme === "system" ? null : initialTheme;
    if (current !== expected) {
      applyTheme(initialTheme);
      void updateTheme(initialTheme);
    }
    // Only run once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(next: Theme) {
    setTheme(next);
    applyTheme(next);
    void updateTheme(next);
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-accent-soft p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-label={opt.label}
          aria-pressed={theme === opt.value}
          title={opt.label}
          onClick={() => handleChange(opt.value)}
          className={`flex flex-1 items-center justify-center rounded-md py-1.5 transition-colors ${
            theme === opt.value ? "bg-raised text-accent shadow-sm" : "text-ink-soft"
          }`}
        >
          <opt.icon size={14} strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}
