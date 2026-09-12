"use client";

import { useFormStatus } from "react-dom";

/**
 * A submit button that disables itself and shows a pending state while its
 * form's server action is in flight — prevents double-submits (e.g.
 * duplicate rows from clicking "Create" twice on a slow connection).
 */
export function SubmitButton({
  children,
  pendingText = "Saving…",
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? pendingText : children}
    </button>
  );
}

/** Same disable-while-pending behavior, but for icon-only buttons whose children shouldn't swap to text. Supports a `formAction` override for multi-button forms. */
export function SubmitIconButton({
  children,
  className,
  formAction,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  formAction?: (formData: FormData) => void;
  "aria-label"?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      formAction={formAction}
      aria-label={ariaLabel}
      disabled={pending}
      aria-busy={pending}
      className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {children}
    </button>
  );
}
