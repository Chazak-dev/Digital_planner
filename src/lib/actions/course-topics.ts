"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTopic(formData: FormData) {
  const supabase = await createClient();
  const courseId = String(formData.get("courseId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { count } = await supabase
    .from("course_topics")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  await supabase.from("course_topics").insert({
    course_id: courseId,
    title,
    order_index: count ?? 0,
  });

  revalidatePath(`/university/${courseId}`);
}

export async function toggleTopicStatus(formData: FormData) {
  const supabase = await createClient();
  const topicId = String(formData.get("topicId"));
  const courseId = String(formData.get("courseId"));
  const done = formData.get("done") === "true";

  await supabase
    .from("course_topics")
    .update({ status: done ? "done" : "not_started" })
    .eq("id", topicId);

  revalidatePath(`/university/${courseId}`);
}

export async function deleteTopic(formData: FormData) {
  const supabase = await createClient();
  const topicId = String(formData.get("topicId"));
  const courseId = String(formData.get("courseId"));

  await supabase.from("course_topics").delete().eq("id", topicId);
  revalidatePath(`/university/${courseId}`);
}
