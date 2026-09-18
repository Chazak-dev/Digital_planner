"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createMilestone(formData: FormData) {
  const supabase = await createClient();
  const goalId = String(formData.get("goalId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { count } = await supabase
    .from("milestones")
    .select("id", { count: "exact", head: true })
    .eq("goal_id", goalId);

  await supabase.from("milestones").insert({
    goal_id: goalId,
    title,
    order_index: count ?? 0,
  });

  revalidatePath(`/goals/${goalId}`);
}

export async function updateMilestone(formData: FormData) {
  const supabase = await createClient();
  const milestoneId = String(formData.get("milestoneId"));
  const goalId = String(formData.get("goalId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await supabase.from("milestones").update({ title }).eq("id", milestoneId);
  revalidatePath(`/goals/${goalId}`);
}

export async function toggleMilestoneStatus(formData: FormData) {
  const supabase = await createClient();
  const milestoneId = String(formData.get("milestoneId"));
  const goalId = String(formData.get("goalId"));
  const done = formData.get("done") === "true";

  await supabase
    .from("milestones")
    .update({ status: done ? "done" : "not_started" })
    .eq("id", milestoneId);

  revalidatePath(`/goals/${goalId}`);
}

export async function deleteMilestone(formData: FormData) {
  const supabase = await createClient();
  const milestoneId = String(formData.get("milestoneId"));
  const goalId = String(formData.get("goalId"));

  await supabase.from("milestones").delete().eq("id", milestoneId);
  revalidatePath(`/goals/${goalId}`);
}
