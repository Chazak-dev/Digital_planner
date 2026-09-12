"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Theme } from "@/lib/theme";

const THEME_COOKIE = "planner-theme";

export async function updateTheme(theme: Theme) {
  const cookieStore = await cookies();

  if (theme === "system") {
    cookieStore.delete(THEME_COOKIE);
  } else {
    cookieStore.set(THEME_COOKIE, theme, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    await supabase.from("profiles").update({ theme }).eq("id", data.user.id);
  }
}
