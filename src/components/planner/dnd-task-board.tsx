"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { reorderTasks } from "@/lib/actions/tasks";
import { TaskRow } from "@/components/task-row";
import type { Task, TaskPriority } from "@/lib/types";

const COLUMNS: { key: TaskPriority; label: string }[] = [
  { key: "must", label: "Must do" },
  { key: "should", label: "Should do" },
  { key: "could", label: "Could do" },
];

type Columns = Record<TaskPriority, Task[]>;

function groupTasks(tasks: Task[]): Columns {
  const sorted = [...tasks].sort((a, b) => a.order_index - b.order_index);
  return {
    must: sorted.filter((t) => t.priority === "must"),
    should: sorted.filter((t) => t.priority === "should"),
    could: sorted.filter((t) => t.priority === "could"),
  };
}

function findColumn(columns: Columns, taskId: string): TaskPriority | null {
  for (const col of COLUMNS) {
    if (columns[col.key].some((t) => t.id === taskId)) return col.key;
  }
  return null;
}

function DroppableColumn({ id, children }: { id: TaskPriority; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="min-h-[2.5rem]">
      {children}
    </div>
  );
}

function SortableTaskRow({
  task,
  subtasks,
  hiddenFields,
  revalidatePath,
}: {
  task: Task;
  subtasks: Task[];
  hiddenFields: Record<string, string>;
  revalidatePath: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-start gap-1"
    >
      <button
        type="button"
        aria-label="Drag to reorder or change priority"
        {...attributes}
        {...listeners}
        className="mt-2.5 shrink-0 touch-none cursor-grab text-ink-soft/60 hover:text-ink-soft active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </button>
      <div className="min-w-0 flex-1">
        <TaskRow task={task} subtasks={subtasks} hiddenFields={hiddenFields} revalidatePath={revalidatePath} />
      </div>
    </div>
  );
}

export function DndTaskBoard({
  tasks,
  hiddenFields,
  revalidatePath,
}: {
  tasks: Task[];
  hiddenFields: Record<string, string>;
  revalidatePath: string;
}) {
  const topLevel = tasks.filter((t) => !t.parent_task_id);
  const subtasksByParent = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.parent_task_id) continue;
    const list = subtasksByParent.get(t.parent_task_id) ?? [];
    list.push(t);
    subtasksByParent.set(t.parent_task_id, list);
  }

  // Re-sync local drag state whenever the server data actually changes (e.g. a
  // task was added/deleted/completed elsewhere) — compared during render, per
  // React's "adjusting state when props change" pattern, not in an effect.
  const signature = topLevel.map((t) => `${t.id}:${t.priority}:${t.order_index}:${t.status}`).join(",");
  const [prevSignature, setPrevSignature] = useState(signature);
  const [columns, setColumns] = useState<Columns>(() => groupTasks(topLevel));
  if (signature !== prevSignature) {
    setPrevSignature(signature);
    setColumns(groupTasks(topLevel));
  }

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragStart(event: DragStartEvent) {
    const col = findColumn(columns, String(event.active.id));
    if (!col) return;
    setActiveTask(columns[col].find((t) => t.id === event.active.id) ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeCol = findColumn(columns, String(active.id));
    const overCol = COLUMNS.some((c) => c.key === over.id)
      ? (over.id as TaskPriority)
      : findColumn(columns, String(over.id));
    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumns((prev) => {
      const activeItems = prev[activeCol];
      const overItems = prev[overCol];
      const activeIndex = activeItems.findIndex((t) => t.id === active.id);
      if (activeIndex === -1) return prev;
      const overIndex = overItems.findIndex((t) => t.id === over.id);
      const movingTask = { ...activeItems[activeIndex], priority: overCol };
      const insertAt = overIndex >= 0 ? overIndex : overItems.length;
      return {
        ...prev,
        [activeCol]: activeItems.filter((t) => t.id !== active.id),
        [overCol]: [...overItems.slice(0, insertAt), movingTask, ...overItems.slice(insertAt)],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeCol = findColumn(columns, String(active.id));
    if (!activeCol) return;
    const overCol = COLUMNS.some((c) => c.key === over.id)
      ? (over.id as TaskPriority)
      : findColumn(columns, String(over.id));
    if (!overCol) return;

    let nextColumns = columns;
    if (activeCol === overCol) {
      const items = columns[activeCol];
      const oldIndex = items.findIndex((t) => t.id === active.id);
      const newIndex = items.findIndex((t) => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        nextColumns = { ...columns, [activeCol]: arrayMove(items, oldIndex, newIndex) };
        setColumns(nextColumns);
      }
    }

    const updates = COLUMNS.flatMap((col) =>
      nextColumns[col.key].map((t, i) => ({ id: t.id, priority: col.key, order_index: i })),
    );
    void reorderTasks(updates, revalidatePath);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.key}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{col.label}</p>
            <DroppableColumn id={col.key}>
              <SortableContext items={columns[col.key].map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="mt-2 flex max-h-[28rem] flex-col gap-1.5 overflow-y-auto pr-1">
                  {columns[col.key].length === 0 && (
                    <p className="text-xs text-ink-soft">Nothing here — drag one over.</p>
                  )}
                  {columns[col.key].map((task) => (
                    <SortableTaskRow
                      key={task.id}
                      task={task}
                      subtasks={subtasksByParent.get(task.id) ?? []}
                      hiddenFields={hiddenFields}
                      revalidatePath={revalidatePath}
                    />
                  ))}
                </div>
              </SortableContext>
            </DroppableColumn>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rounded-lg border border-accent bg-raised px-3 py-2.5 text-sm text-ink shadow-sm">
            {activeTask.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
