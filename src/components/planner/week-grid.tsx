"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Inbox as InboxIcon } from "lucide-react";
import { toggleTaskStatus, dragRescheduleTask, dragUnscheduleTask } from "@/lib/actions/tasks";
import { TaskCheckbox } from "@/components/task-checkbox";
import type { Task } from "@/lib/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const INBOX_COL = "inbox";

export type WeekDay = {
  date: string;
  dayOfWeek: number;
  isToday: boolean;
  classCount: number;
  deadlines: { id: string; title: string; color: string }[];
  tasks: Task[];
};

type Columns = Record<string, Task[]>;

function buildColumns(days: WeekDay[], inboxTasks: Task[]): Columns {
  const cols: Columns = { [INBOX_COL]: inboxTasks };
  for (const day of days) cols[day.date] = day.tasks;
  return cols;
}

function findColumn(columns: Columns, taskId: string): string | null {
  for (const key of Object.keys(columns)) {
    if (columns[key].some((t) => t.id === taskId)) return key;
  }
  return null;
}

function DraggableChip({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  return (
    <span
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.3 : 1 }}
      className={`cursor-grab touch-none text-xs leading-snug active:cursor-grabbing ${
        task.status === "done" ? "text-ink-soft line-through" : "text-ink"
      }`}
    >
      {task.title}
    </span>
  );
}

function DroppableZone({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`min-h-[2.5rem] rounded-lg transition-colors ${isOver ? "bg-accent-soft/70" : ""}`}>
      {children}
    </div>
  );
}

export function WeekGrid({
  days,
  inboxTasks,
  revalidatePath,
}: {
  days: WeekDay[];
  inboxTasks: Task[];
  revalidatePath: string;
}) {
  const initialColumns = buildColumns(days, inboxTasks);
  const signature = Object.entries(initialColumns)
    .flatMap(([key, tasks]) => tasks.map((t) => `${key}:${t.id}:${t.status}`))
    .join(",");
  const [prevSignature, setPrevSignature] = useState(signature);
  const [columns, setColumns] = useState<Columns>(initialColumns);
  if (signature !== prevSignature) {
    setPrevSignature(signature);
    setColumns(initialColumns);
  }

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragStart(event: DragStartEvent) {
    const col = findColumn(columns, String(event.active.id));
    if (!col) return;
    setActiveTask(columns[col].find((t) => t.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const destCol = String(over.id);
    const sourceCol = findColumn(columns, String(active.id));
    if (!sourceCol || sourceCol === destCol) return;

    setColumns((prev) => {
      const task = prev[sourceCol]?.find((t) => t.id === active.id);
      if (!task) return prev;
      return {
        ...prev,
        [sourceCol]: prev[sourceCol].filter((t) => t.id !== active.id),
        [destCol]: [...(prev[destCol] ?? []), task],
      };
    });

    if (destCol === INBOX_COL) {
      void dragUnscheduleTask(String(active.id), revalidatePath);
    } else {
      void dragRescheduleTask(String(active.id), destCol, revalidatePath);
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="rounded-xl border border-dashed border-border bg-raised p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <InboxIcon size={13} /> Inbox
        </p>
        <p className="mt-0.5 text-[11px] text-ink-soft">Drag one of these onto a day, or drag a task here to unschedule it.</p>
        <DroppableZone id={INBOX_COL}>
          <div className="mt-2 flex max-h-24 flex-wrap items-center gap-x-4 gap-y-1.5 overflow-y-auto">
            {(columns[INBOX_COL] ?? []).length === 0 && (
              <span className="text-xs text-ink-soft">Nothing unscheduled.</span>
            )}
            {(columns[INBOX_COL] ?? []).map((task) => (
              <div key={task.id} className="flex items-center gap-1.5">
                <form action={toggleTaskStatus} className="contents">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="revalidatePath" value={revalidatePath} />
                  <TaskCheckbox defaultChecked={task.status === "done"} />
                </form>
                <DraggableChip task={task} />
              </div>
            ))}
          </div>
        </DroppableZone>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-7">
        {days.map((day) => {
          const tasks = columns[day.date] ?? [];
          const sortedTasks = [...tasks].sort((a, b) => {
            const order = { must: 0, should: 1, could: 2 };
            return order[a.priority] - order[b.priority];
          });

          return (
            <div
              key={day.date}
              className={`rounded-xl border p-2.5 ${
                day.isToday ? "border-accent bg-accent-soft/40" : "border-border bg-raised"
              }`}
            >
              <Link href={`/planner?view=day&date=${day.date}`} className="block">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                  {DAY_LABELS[day.dayOfWeek]}
                </p>
                <p className={`font-display text-base font-semibold ${day.isToday ? "text-accent" : "text-ink"}`}>
                  {Number(day.date.slice(-2))}
                </p>
              </Link>

              {(day.classCount > 0 || day.deadlines.length > 0) && (
                <div className="mt-1.5 flex flex-col gap-1">
                  {day.classCount > 0 && (
                    <p className="text-[11px] text-ink-soft">
                      {day.classCount} class{day.classCount > 1 ? "es" : ""}
                    </p>
                  )}
                  {day.deadlines.map((d) => (
                    <p key={d.id} className="flex items-center gap-1 text-[11px] text-ink-soft">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: d.color }} />
                      <span className="truncate">{d.title}</span>
                    </p>
                  ))}
                </div>
              )}

              <DroppableZone id={day.date}>
                <div className="mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto pr-0.5">
                  {sortedTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-1.5">
                      <form action={toggleTaskStatus} className="contents">
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="revalidatePath" value={revalidatePath} />
                        <TaskCheckbox defaultChecked={task.status === "done"} />
                      </form>
                      <DraggableChip task={task} />
                    </div>
                  ))}
                </div>
              </DroppableZone>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rounded-md border border-accent bg-raised px-2 py-1 text-xs text-ink shadow-sm">
            {activeTask.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
