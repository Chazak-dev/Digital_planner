"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createClassSlot(formData: FormData) {
  const supabase = await createClient();
  const courseId = String(formData.get("courseId"));
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  if (!startTime || !endTime) return;

  await supabase.from("class_schedule").insert({
    course_id: courseId,
    day_of_week: Number(formData.get("dayOfWeek") ?? 1),
    start_time: startTime,
    end_time: endTime,
    location: (formData.get("location") as string) || null,
  });

  revalidatePath(`/university/${courseId}`);
}

export async function deleteClassSlot(formData: FormData) {
  const supabase = await createClient();
  const slotId = String(formData.get("slotId"));
  const courseId = String(formData.get("courseId"));

  await supabase.from("class_schedule").delete().eq("id", slotId);
  revalidatePath(`/university/${courseId}`);
}
