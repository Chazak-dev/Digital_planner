import { X } from "lucide-react";
import { dismissMotivationalMessage } from "@/lib/actions/dashboard";

const MESSAGES = [
  "One thing at a time — that's plenty.",
  "Progress doesn't have to be loud to count.",
  "You don't need a perfect plan, just a next step.",
  "Small and steady beats big and stalled.",
];

export function MotivationalBanner() {
  const message = MESSAGES[new Date().getDate() % MESSAGES.length];

  return (
    <div className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
      <p className="flex-1">{message}</p>
      <form action={dismissMotivationalMessage}>
        <button
          type="submit"
          aria-label="Hide this message"
          className="rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
        >
          <X size={14} />
        </button>
      </form>
    </div>
  );
}
