"use client";

import { useState } from "react";

const TABS = ["Tasks", "Assessments", "Topics", "Notes & Schedule"] as const;
type Tab = (typeof TABS)[number];

export function CourseTabs({
  tasks,
  assessments,
  topics,
  notesSchedule,
}: {
  tasks: React.ReactNode;
  assessments: React.ReactNode;
  topics: React.ReactNode;
  notesSchedule: React.ReactNode;
}) {
  const [active, setActive] = useState<Tab>("Tasks");

  const content: Record<Tab, React.ReactNode> = {
    Tasks: tasks,
    Assessments: assessments,
    Topics: topics,
    "Notes & Schedule": notesSchedule,
  };

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active === tab
                ? "border-accent text-accent"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="pt-5">{content[active]}</div>
    </div>
  );
}
