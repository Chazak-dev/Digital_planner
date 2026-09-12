"use client";

import { useState } from "react";
import { setGoalProgress } from "@/lib/actions/goals";
import { SubmitButton } from "@/components/submit-button";
import type { ProgressMode } from "@/lib/types";

export function ProgressControl({
  goalId,
  progressMode,
  progressPercent,
}: {
  goalId: string;
  progressMode: ProgressMode;
  progressPercent: number;
}) {
  const [mode, setMode] = useState<ProgressMode>(progressMode);

  return (
    <form action={setGoalProgress} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="goalId" value={goalId} />
      <div className="flex items-center gap-1 rounded-lg bg-accent-soft p-1">
        {(["auto", "manual"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === m ? "bg-raised text-accent shadow-sm" : "text-ink-soft"
            }`}
          >
            {m === "auto" ? "Auto (from tasks)" : "Manual"}
          </button>
        ))}
      </div>
      <input type="hidden" name="progressMode" value={mode} />
      {mode === "manual" && (
        <>
          <input
            type="number"
            name="percent"
            min={0}
            max={100}
            defaultValue={progressPercent}
            className="w-16 rounded-lg border border-border bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
          />
          <span className="text-sm text-ink-soft">%</span>
        </>
      )}
      <SubmitButton
        pendingText="Saving…"
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
      >
        Save
      </SubmitButton>
    </form>
  );
}
