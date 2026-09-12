"use client";

import { useFormStatus } from "react-dom";

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  className,
  formAction,
  "aria-label": ariaLabel,
}: {
  confirmMessage: string;
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
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
