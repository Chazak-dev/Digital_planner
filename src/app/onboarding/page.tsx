import { completeOnboarding, skipOnboarding } from "@/lib/actions/settings";
import { SubmitButton } from "@/components/submit-button";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function OnboardingPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-paper px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-raised p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-ink">Welcome to your planner</h1>
        <p className="mt-2 text-sm text-ink-soft">
          University and Personal stay in their own spaces, deadlines are always optional, and
          nothing here rearranges your plan without asking first. A couple of quick preferences —
          you can change any of these later in Settings.
        </p>

        <form action={completeOnboarding} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink">
            What should we call you? <span className="text-ink-soft">(optional)</span>
            <input
              type="text"
              name="displayName"
              autoFocus
              className="rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink">
            Week starts on
            <select
              name="weekStartDay"
              defaultValue={1}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-accent"
            >
              {DAY_LABELS.map((label, i) => (
                <option key={label} value={i}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Date format
              <select
                name="dateFormat"
                defaultValue="MM/DD/YYYY"
                className="rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-accent"
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
                defaultValue="12h"
                className="rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-accent"
              >
                <option value="12h">12-hour</option>
                <option value="24h">24-hour</option>
              </select>
            </label>
          </div>

          <SubmitButton
            pendingText="Setting up…"
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Get started
          </SubmitButton>
        </form>

        <form action={skipOnboarding} className="mt-3">
          <SubmitButton
            pendingText="…"
            className="w-full rounded-lg px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-accent"
          >
            Skip for now, use defaults
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
