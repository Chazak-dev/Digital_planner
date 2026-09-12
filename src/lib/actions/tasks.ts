"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recomputeGoalProgress } from "@/lib/goal-progress";

/**
 * Shared task mutations — used by University (course tasks), Goals (goal
 * tasks), and later Inbox and the Planner, since every task-like thing
 * lives in one table regardless of where it's created from.
 */

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const revalidate = String(formData.get("revalidatePath") ?? "/");
  const goalId = (formData.get("goalId") as string) || null;
  const courseId = (formData.get("courseId") as string) || null;
  const scheduledDate = (formData.get("scheduledDate") as string) || null;

  // No course, no goal, no scheduled date — nothing to organize it under yet,
  // so it belongs in the inbox until you give it one of those.
  const hasScope = Boolean(courseId || goalId || scheduledDate);

  await supabase.from("tasks").insert({
    user_id: data.user.id,
    title,
    area: String(formData.get("area") ?? "personal"),
    course_id: courseId,
    goal_id: goalId,
    milestone_id: (formData.get("milestoneId") as string) || null,
    parent_task_id: (formData.get("parentTaskId") as string) || null,
    priority: (formData.get("priority") as string) || "should",
    due_date: (formData.get("dueDate") as string) || null,
    scheduled_date: scheduledDate,
    estimated_minutes: formData.get("estimatedMinutes")
      ? Number(formData.get("estimatedMinutes"))
      : null,
    status: hasScope ? "planned" : "inbox",
  });

  if (goalId) await recomputeGoalProgress(supabase, goalId);
  revalidatePath(revalidate);
}

export async function updateTaskDetails(formData: FormData) {
  const supabase = await createClient();
  const taskId = String(formData.get("taskId"));
  const revalidate = String(formData.get("revalidatePath") ?? "/");
  const dueDate = (formData.get("dueDate") as string) || null;
  const scheduledDate = (formData.get("scheduledDate") as string) || null;

  const tagsRaw = String(formData.get("tags") ?? "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const { data: current } = await supabase.from("tasks").select("status").eq("id", taskId).maybeSingle();

  await supabase
    .from("tasks")
    .update({
      description: (formData.get("description") as string) || null,
      notes: (formData.get("notes") as string) || null,
      priority: (formData.get("priority") as string) || "should",
      due_date: dueDate,
      scheduled_date: scheduledDate,
      scheduled_time: (formData.get("scheduledTime") as string) || null,
      estimated_minutes: formData.get("estimatedMinutes")
        ? Number(formData.get("estimatedMinutes"))
        : null,
      energy_level: (formData.get("energyLevel") as string) || null,
      tags,
      // Giving an inbox task a date is one of the ways it gets "organized" —
      // promote it out, same rule as at creation. Any other status is left alone.
      ...(current?.status === "inbox" && (dueDate || scheduledDate) ? { status: "planned" } : {}),
    })
    .eq("id", taskId);

  revalidatePath(revalidate);
}

/** Assigns an inbox task to a course or goal (or just schedules it), moving it out of the inbox. */
export async function organizeInboxTask(formData: FormData) {
  const supabase = await createClient();
  const taskId = String(formData.get("taskId"));
  const revalidate = String(formData.get("revalidatePath") ?? "/inbox");
  const courseId = (formData.get("courseId") as string) || null;
  const goalId = (formData.get("goalId") as string) || null;
  const scheduledDate = (formData.get("scheduledDate") as string) || null;

  if (!courseId && !goalId && !scheduledDate) return;

  await supabase
    .from("tasks")
    .update({
      course_id: courseId,
      goal_id: courseId ? null : goalId,
      area: courseId ? "university" : "personal",
      scheduled_date: scheduledDate,
      status: "planned",
    })
    .eq("id", taskId);

  if (goalId) await recomputeGoalProgress(supabase, goalId);
  revalidatePath(revalidate);
  revalidatePath("/");
}

/**
 * Persists a drag-and-drop rearrangement: new priority (if the task moved
 * columns) and new order_index for every task whose position changed.
 * Called directly from a client component, not bound to a <form>.
 */
export async function reorderTasks(
  updates: { id: string; priority: string; order_index: number }[],
  revalidate: string,
) {
  const supabase = await createClient();

  await Promise.all(
    updates.map((u) =>
      supabase.from("tasks").update({ priority: u.priority, order_index: u.order_index }).eq("id", u.id),
    ),
  );

  revalidatePath(revalidate);
}

export async function rescheduleTask(formData: FormData) {
  const supabase = await createClient();
  const taskId = String(formData.get("taskId"));
  const scheduledDate = String(formData.get("scheduledDate"));
  const revalidate = String(formData.get("revalidatePath") ?? "/");

  await supabase
    .from("tasks")
    .update({ scheduled_date: scheduledDate, status: "planned" })
    .eq("id", taskId);

  revalidatePath(revalidate);
}

/** Drag a task onto a day in the Week grid — same effect as rescheduleTask, just called directly from client code instead of a <form>. */
export async function dragRescheduleTask(taskId: string, scheduledDate: string, revalidate: string) {
  const supabase = await createClient();
  await supabase.from("tasks").update({ scheduled_date: scheduledDate, status: "planned" }).eq("id", taskId);
  revalidatePath(revalidate);
}

/** Drag a task back into the Week grid's Inbox strip — clears its date; drops all the way to "inbox" only if it also has no course/goal. */
export async function dragUnscheduleTask(taskId: string, revalidate: string) {
  const supabase = await createClient();
  const { data: task } = await supabase
    .from("tasks")
    .select("course_id, goal_id")
    .eq("id", taskId)
    .maybeSingle();
  const hasScope = Boolean(task?.course_id || task?.goal_id);

  await supabase
    .from("tasks")
    .update({ scheduled_date: null, status: hasScope ? "planned" : "inbox" })
    .eq("id", taskId);

  revalidatePath(revalidate);
}

export async function toggleTaskStatus(formData: FormData) {
  const supabase = await createClient();
  const taskId = String(formData.get("taskId"));
  const done = formData.get("done") === "true";
  const revalidate = String(formData.get("revalidatePath") ?? "/");

  const { data: task } = await supabase
    .from("tasks")
    .update({
      status: done ? "done" : "planned",
      completed_at: done ? new Date().toISOString() : null,
    })
    .eq("id", taskId)
    .select("goal_id")
    .single();

  if (task?.goal_id) await recomputeGoalProgress(supabase, task.goal_id);
  revalidatePath(revalidate);
}

export async function deleteTask(formData: FormData) {
  const supabase = await createClient();
  const taskId = String(formData.get("taskId"));
  const revalidate = String(formData.get("revalidatePath") ?? "/");

  const { data: task } = await supabase
    .from("tasks")
    .select("goal_id")
    .eq("id", taskId)
    .maybeSingle();

  await supabase.from("tasks").delete().eq("id", taskId);

  if (task?.goal_id) await recomputeGoalProgress(supabase, task.goal_id);
  revalidatePath(revalidate);
}
