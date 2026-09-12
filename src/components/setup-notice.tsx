export function SetupNotice() {
  return (
    <div className="flex flex-1 items-center justify-center bg-paper px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-raised p-8 text-center shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-ink">Almost there</h1>
        <p className="mt-3 text-sm text-ink-soft">
          This planner needs a Supabase project to sign you in and store anything. Copy{" "}
          <code className="rounded bg-accent-soft px-1.5 py-0.5 text-accent">.env.example</code>{" "}
          to <code className="rounded bg-accent-soft px-1.5 py-0.5 text-accent">.env.local</code>,
          fill in your project&apos;s URL and anon key, then restart{" "}
          <code className="rounded bg-accent-soft px-1.5 py-0.5 text-accent">npm run dev</code>.
        </p>
        <p className="mt-4 text-sm text-ink-soft">See the README for the full walkthrough.</p>
      </div>
    </div>
  );
}
