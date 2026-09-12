"use client";

export function TaskCheckbox({ defaultChecked }: { defaultChecked: boolean }) {
  return (
    <input
      type="checkbox"
      name="done"
      value="true"
      defaultChecked={defaultChecked}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="h-4 w-4 shrink-0 cursor-pointer rounded border-border text-accent accent-accent"
    />
  );
}
