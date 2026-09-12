"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createNote(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  const ownerType = String(formData.get("ownerType"));
  const ownerId = String(formData.get("ownerId"));
  const kind = (formData.get("kind") as string) || "note";
  const title = String(formData.get("title") ?? "").trim();
  const content = (formData.get("content") as string) || null;
  const url = (formData.get("url") as string) || null;
  const revalidate = String(formData.get("revalidatePath") ?? "/");

  if (!title && !content && !url) return;

  await supabase.from("notes").insert({
    user_id: data.user.id,
    owner_type: ownerType,
    owner_id: ownerId,
    kind,
    title: title || null,
    content,
    url,
  });

  revalidatePath(revalidate);
}

export async function deleteNote(formData: FormData) {
  const supabase = await createClient();
  const noteId = String(formData.get("noteId"));
  const revalidate = String(formData.get("revalidatePath") ?? "/");

  await supabase.from("notes").delete().eq("id", noteId);
  revalidatePath(revalidate);
}
