import Link from "next/link";
import { signUp } from "../actions";
import { SubmitButton } from "@/components/submit-button";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkEmail?: string }>;
}) {
  const { error, checkEmail } = await searchParams;

  if (checkEmail) {
    return (
      <>
        <h1 className="font-display text-2xl font-semibold text-ink">Check your email</h1>
        <p className="mt-2 text-sm text-ink-soft">
          We sent a confirmation link. Open it to finish creating your account, then come back
          and sign in.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-accent">
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold text-ink">Create your planner</h1>
      <p className="mt-1 text-sm text-ink-soft">One account, all your devices.</p>

      {error && (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{error}</p>
      )}

      <form action={signUp} className="mt-6 flex flex-col gap-4">
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
            minLength={8}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-accent"
          />
        </label>
        <SubmitButton
          pendingText="Creating account…"
          className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Create account
        </SubmitButton>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Already have one?{" "}
        <Link href="/login" className="font-medium text-accent">
          Sign in
        </Link>
      </p>
    </>
  );
}
