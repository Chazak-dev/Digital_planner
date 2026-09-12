import { Plus } from "lucide-react";
import { createTask } from "@/lib/actions/tasks";
import { SubmitButton } from "@/components/submit-button";

export function QuickAddForm() {
  return (
    <form action={createTask} className="flex items-center gap-2">
      <input type="hidden" name="area" value="personal" />
      <input type="hidden" name="revalidatePath" value="/" />
      <input
        type="text"
        name="title"
        placeholder="Quickly add a task… it'll land in your inbox"
        required
        className="min-w-0 flex-1 rounded-lg border border-border bg-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent"
      />
      <SubmitButton
        pendingText="Adding…"
        className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Plus size={16} /> Add
      </SubmitButton>
    </form>
  );
}
