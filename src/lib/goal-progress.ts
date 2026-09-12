import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Recomputes a goal's auto progress from its tasks and logs a
 * progress_history row when the number actually changes. No-ops for goals
 * in manual mode — their percent is only ever set by the person, on purpose.
 */
export async function recomputeGoalProgress(supabase: SupabaseClient, goalId: string) {
  const { data: goal } = await supabase
    .from("goals")
    .select("progress_mode, progress_percent")
    .eq("id", goalId)
    .maybeSingle();

  if (!goal || goal.progress_mode !== "auto") return;

  const { data: tasks } = await supabase.from("tasks").select("status").eq("goal_id", goalId);
  const total = tasks?.length ?? 0;
  const done = tasks?.filter((t) => t.status === "done").length ?? 0;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  if (percent === goal.progress_percent) return;

  await supabase.from("goals").update({ progress_percent: percent }).eq("id", goalId);
  await supabase.from("progress_history").insert({ goal_id: goalId, percent });
}
