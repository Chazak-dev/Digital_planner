import { createClient } from "@/lib/supabase/server";
import { updatePreferences, updateDashboardWidgets } from "@/lib/actions/settings";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavOrderEditor } from "@/components/settings/nav-order-editor";
import { SubmitButton } from "@/components/submit-button";
import type { Theme } from "@/lib/theme";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Profile = {
  display_name: string | null;
  theme: string;
  week_start_day: number;
  date_format: string;
  time_format: string;
  default_daily_view: string;
  nav_order: string[] | null;
  dashboard_widgets: Record<string, boolean> | null;
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, theme, week_start_day, date_format, time_format, default_daily_view, nav_order, dashboard_widgets")
    .eq("id", auth.user.id)
    .maybeSingle();

  const p = (profile ?? {}) as Partial<Profile>;
  const widgets = p.dashboard_widgets ?? {
    priorities: true,
    week: true,
    deadlines: true,
    goals: true,
    completed: true,
  };

  return (
    <div className="flex flex-1 flex-col bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">{auth.user.email}</p>

        <section className="mt-8">
          <h2 className="font-display text-base font-semibold text-ink">Appearance</h2>
          <div className="mt-3">
            <ThemeToggle initialTheme={(p.theme as Theme) ?? "system"} />
          </div>
        </section>

        <section className="mt-8 border-t border-border pt-8">
          <h2 className="font-display text-base font-semibold text-ink">Planning preferences</h2>
          <form action={updatePreferences} className="mt-3 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Display name <span className="text-ink-soft">(optional, shown in your greeting)</span>
              <input
                type="text"
                name="displayName"
                defaultValue={p.display_name ?? ""}
                className="max-w-xs rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-ink">
                Week starts on
                <select
                  name="weekStartDay"
                  defaultValue={p.week_start_day ?? 1}
                  className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
                >
                  {DAY_LABELS.map((label, i) => (
                    <option key={label} value={i}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm text-ink">
                Default Planner view
                <select
                  name="defaultDailyView"
                  defaultValue={p.default_daily_view ?? "day"}
                  className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm text-ink">
                Date format
                <select
                  name="dateFormat"
                  defaultValue={p.date_format ?? "MM/DD/YYYY"}
                  className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm text-ink">
                Time format
                <select
                  name="timeFormat"
                  defaultValue={p.time_format ?? "12h"}
                  className="rounded-lg border border-border bg-raised px-3 py-2 text-ink outline-none focus:border-accent"
                >
                  <option value="12h">12-hour</option>
                  <option value="24h">24-hour</option>
                </select>
              </label>
            </div>

            <SubmitButton
              pendingText="Saving…"
              className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Save preferences
            </SubmitButton>
          </form>
          <p className="mt-2 text-xs text-ink-soft">
            Date format currently shows up on the Dashboard and Goals pages — applying it everywhere
            else tasks show a date is a small follow-up, not done yet.
          </p>
        </section>

        <section className="mt-8 border-t border-border pt-8">
          <h2 className="font-display text-base font-semibold text-ink">Navigation order</h2>
          <p className="mt-1 text-sm text-ink-soft">Rearrange the sidebar to match how you actually use it.</p>
          <div className="mt-3">
            <NavOrderEditor initialOrder={p.nav_order ?? null} />
          </div>
        </section>

        <section className="mt-8 border-t border-border pt-8">
          <h2 className="font-display text-base font-semibold text-ink">Dashboard widgets</h2>
          <p className="mt-1 text-sm text-ink-soft">Choose what shows up on your Dashboard.</p>
          <form action={updateDashboardWidgets} className="mt-3 flex flex-col gap-2">
            {[
              { key: "priorities", label: "Today's priorities" },
              { key: "week", label: "This week strip" },
              { key: "deadlines", label: "Upcoming deadlines" },
              { key: "goals", label: "Active goals" },
              { key: "completed", label: "Recently completed" },
            ].map((w) => (
              <label key={w.key} className="flex items-center gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  name={w.key}
                  value="true"
                  defaultChecked={widgets[w.key] !== false}
                  className="h-4 w-4 rounded border-border accent-accent"
                />
                {w.label}
              </label>
            ))}
            <SubmitButton
              pendingText="Saving…"
              className="mt-2 self-start rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Save widgets
            </SubmitButton>
          </form>
          <p className="mt-2 text-xs text-ink-soft">
            Rearranging card order isn&apos;t built yet — this covers show/hide for now.
          </p>
        </section>
      </div>
    </div>
  );
}
