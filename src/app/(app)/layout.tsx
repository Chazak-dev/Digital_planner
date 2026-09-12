import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/nav/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import type { Theme } from "@/lib/theme";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  let theme: Theme = "system";
  let navOrder: string[] | null = null;
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("theme, nav_order")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile?.theme === "light" || profile?.theme === "dark") {
      theme = profile.theme;
    }
    navOrder = (profile?.nav_order as string[] | null) ?? null;
  }

  return (
    <AppShell email={data.user?.email} initialTheme={theme} navOrder={navOrder}>
      {children}
    </AppShell>
  );
}
