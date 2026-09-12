import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GoalsFilterGrid } from "@/components/goals/goals-filter-grid";
import type { DateFormat } from "@/lib/format-date";
import type { Goal } from "@/lib/types";

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [{ data: goals }, { data: profile }] = await Promise.all([
    supabase.from("goals").select("*").eq("user_id", auth.user.id).order("created_at", { ascending: true }),
    supabase.from("profiles").select("date_format").eq("id", auth.user.id).maybeSingle(),
  ]);
  const dateFormat = (profile?.date_format as DateFormat) ?? "MM/DD/YYYY";

  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Goals</h1>
            <p className="mt-1 text-sm text-ink-soft">Career, skills, projects, health, habits — on your terms.</p>
          </div>
          <Link
            href="/goals/new"
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} /> New goal
          </Link>
        </div>

        <GoalsFilterGrid goals={(goals ?? []) as Goal[]} dateFormat={dateFormat} />
      </div>
    </div>
  );
}
