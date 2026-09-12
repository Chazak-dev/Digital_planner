"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function dismissMotivationalMessage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  await supabase
    .from("profiles")
    .update({ show_motivational_message: false })
    .eq("id", data.user.id);

  revalidatePath("/");
}
