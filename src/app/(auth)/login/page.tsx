import Link from "next/link";
import { signIn } from "../actions";
import { SubmitButton } from "@/components/submit-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <>
      <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-soft">Sign in to your planner.</p>

      {error && (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{error}</p>
      )}

      <form action={signIn} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="next" value={next ?? "/"} />
        <label className="flex flex-col gap-1 text-sm text-ink">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Password
          <input
            type="password"
            name="password"
            required
            className="rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-accent"
          />
        </label>
        <SubmitButton
          pendingText="Signing in…"
          className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Sign in
        </SubmitButton>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-accent">
          Create one
        </Link>
      </p>
    </>
  );
}
