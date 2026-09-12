"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  await supabase
    .from("profiles")
    .update({
      display_name: (formData.get("displayName") as string) || null,
      week_start_day: Number(formData.get("weekStartDay") ?? 1),
      date_format: (formData.get("dateFormat") as string) || "MM/DD/YYYY",
      time_format: (formData.get("timeFormat") as string) || "12h",
      default_daily_view: (formData.get("defaultDailyView") as string) || "day",
    })
    .eq("id", data.user.id);

  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/planner");
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  await supabase
    .from("profiles")
    .update({
      display_name: (formData.get("displayName") as string) || null,
      week_start_day: Number(formData.get("weekStartDay") ?? 1),
      date_format: (formData.get("dateFormat") as string) || "MM/DD/YYYY",
      time_format: (formData.get("timeFormat") as string) || "12h",
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", data.user.id);

  redirect("/");
}

export async function skipOnboarding() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", data.user.id);

  redirect("/");
}

export async function updateDashboardWidgets(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  const widgets = {
    priorities: formData.get("priorities") === "true",
    week: formData.get("week") === "true",
    deadlines: formData.get("deadlines") === "true",
    goals: formData.get("goals") === "true",
    completed: formData.get("completed") === "true",
  };

  await supabase.from("profiles").update({ dashboard_widgets: widgets }).eq("id", data.user.id);

  revalidatePath("/settings");
  revalidatePath("/");
}

/** Called directly from the nav-order editor, not bound to a <form>. */
export async function updateNavOrder(order: string[]) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  await supabase.from("profiles").update({ nav_order: order }).eq("id", data.user.id);
  revalidatePath("/", "layout");
}
