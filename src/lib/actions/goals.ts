"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recomputeGoalProgress } from "@/lib/goal-progress";

export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { data: goal, error } = await supabase
    .from("goals")
    .insert({
      user_id: data.user.id,
      title,
      description: (formData.get("description") as string) || null,
      category: (formData.get("category") as string) || "other",
      color: (formData.get("color") as string) || "#c96a87",
      icon: (formData.get("icon") as string) || null,
      priority: (formData.get("priority") as string) || "medium",
      status: (formData.get("status") as string) || "active",
      deadline: (formData.get("deadline") as string) || null,
    })
    .select("id")
    .single();

  revalidatePath("/goals");
  if (!error && goal) redirect(`/goals/${goal.id}`);
}

export async function updateGoal(formData: FormData) {
  const supabase = await createClient();
  const goalId = String(formData.get("goalId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await supabase
    .from("goals")
    .update({
      title,
      description: (formData.get("description") as string) || null,
      category: (formData.get("category") as string) || "other",
      color: (formData.get("color") as string) || "#c96a87",
      icon: (formData.get("icon") as string) || null,
      priority: (formData.get("priority") as string) || "medium",
      status: (formData.get("status") as string) || "active",
      deadline: (formData.get("deadline") as string) || null,
    })
    .eq("id", goalId);

  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);
}

export async function deleteGoal(formData: FormData) {
  const supabase = await createClient();
  const goalId = String(formData.get("goalId"));

  await supabase.from("notes").delete().eq("owner_type", "goal").eq("owner_id", goalId);
  await supabase.from("goals").delete().eq("id", goalId);

  revalidatePath("/goals");
  redirect("/goals");
}

export async function setGoalProgress(formData: FormData) {
  const supabase = await createClient();
  const goalId = String(formData.get("goalId"));
  const mode = String(formData.get("progressMode") ?? "auto");

  if (mode === "manual") {
    const percent = Math.max(0, Math.min(100, Number(formData.get("percent") ?? 0)));
    await supabase
      .from("goals")
      .update({ progress_mode: "manual", progress_percent: percent })
      .eq("id", goalId);
    await supabase.from("progress_history").insert({ goal_id: goalId, percent, note: "Set manually" });
  } else {
    await supabase.from("goals").update({ progress_mode: "auto" }).eq("id", goalId);
    await recomputeGoalProgress(supabase, goalId);
  }

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/goals");
}
