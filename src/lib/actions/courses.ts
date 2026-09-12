"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      user_id: data.user.id,
      name,
      code: (formData.get("code") as string) || null,
      color: (formData.get("color") as string) || "#c96a87",
      term_start: (formData.get("termStart") as string) || null,
      term_end: (formData.get("termEnd") as string) || null,
      credit_hours: formData.get("creditHours") ? Number(formData.get("creditHours")) : null,
    })
    .select("id")
    .single();

  revalidatePath("/university");
  if (!error && course) {
    redirect(`/university/${course.id}`);
  }
}

export async function updateCourse(formData: FormData) {
  const supabase = await createClient();
  const courseId = String(formData.get("courseId"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await supabase
    .from("courses")
    .update({
      name,
      code: (formData.get("code") as string) || null,
      color: (formData.get("color") as string) || "#c96a87",
      term_start: (formData.get("termStart") as string) || null,
      term_end: (formData.get("termEnd") as string) || null,
      credit_hours: formData.get("creditHours") ? Number(formData.get("creditHours")) : null,
    })
    .eq("id", courseId);

  revalidatePath("/university");
  revalidatePath(`/university/${courseId}`);
}

export async function setCourseArchived(formData: FormData) {
  const supabase = await createClient();
  const courseId = String(formData.get("courseId"));
  const archived = formData.get("archived") === "true";

  await supabase.from("courses").update({ archived }).eq("id", courseId);

  revalidatePath("/university");
  revalidatePath(`/university/${courseId}`);
  if (archived) redirect("/university");
}

export async function deleteCourse(formData: FormData) {
  const supabase = await createClient();
  const courseId = String(formData.get("courseId"));

  // Notes are polymorphic (no real FK), so they don't cascade automatically.
  await supabase.from("notes").delete().eq("owner_type", "course").eq("owner_id", courseId);
  await supabase.from("courses").delete().eq("id", courseId);

  revalidatePath("/university");
  redirect("/university");
}
