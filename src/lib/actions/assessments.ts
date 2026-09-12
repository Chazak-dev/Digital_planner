"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function combineDueDateTime(formData: FormData): string | null {
  const dueDate = (formData.get("dueDate") as string) || "";
  const dueTime = (formData.get("dueTime") as string) || "";
  if (!dueDate) return null;
  return dueTime ? `${dueDate}T${dueTime}:00` : dueDate;
}

export async function createAssessment(formData: FormData) {
  const supabase = await createClient();
  const courseId = String(formData.get("courseId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await supabase.from("assessments").insert({
    course_id: courseId,
    type: (formData.get("type") as string) || "assignment",
    title,
    due_date: combineDueDateTime(formData),
  });

  revalidatePath(`/university/${courseId}`);
}

export async function updateAssessment(formData: FormData) {
  const supabase = await createClient();
  const assessmentId = String(formData.get("assessmentId"));
  const courseId = String(formData.get("courseId"));

  const gradeEarned = formData.get("gradeEarned");
  const gradePossible = formData.get("gradePossible");

  await supabase
    .from("assessments")
    .update({
      status: (formData.get("status") as string) || "upcoming",
      grade_earned: gradeEarned ? Number(gradeEarned) : null,
      grade_possible: gradePossible ? Number(gradePossible) : null,
      due_date: combineDueDateTime(formData),
    })
    .eq("id", assessmentId);

  revalidatePath(`/university/${courseId}`);
}

export async function deleteAssessment(formData: FormData) {
  const supabase = await createClient();
  const assessmentId = String(formData.get("assessmentId"));
  const courseId = String(formData.get("courseId"));

  await supabase.from("assessments").delete().eq("id", assessmentId);
  revalidatePath(`/university/${courseId}`);
}
