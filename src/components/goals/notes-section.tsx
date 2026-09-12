import { Trash2, Link as LinkIcon, StickyNote } from "lucide-react";
import { createNote, deleteNote } from "@/lib/actions/notes";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton } from "@/components/submit-button";
import type { Note } from "@/lib/types";

export function NotesSection({ goalId, notes }: { goalId: string; notes: Note[] }) {
  const revalidatePath = `/goals/${goalId}`;

  return (
    <div>
      <h2 className="font-display text-base font-semibold text-ink">Notes &amp; resources</h2>

      <form action={createNote} className="mt-3 flex flex-col gap-2">
        <input type="hidden" name="ownerType" value="goal" />
        <input type="hidden" name="ownerId" value={goalId} />
        <input type="hidden" name="revalidatePath" value={revalidatePath} />
        <div className="flex gap-2">
          <input
            type="text"
            name="title"
            placeholder="Title (optional)"
            className="min-w-0 flex-1 rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <select
            name="kind"
            defaultValue="note"
            className="rounded-lg border border-border bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            <option value="note">Note</option>
            <option value="link">Link</option>
          </select>
        </div>
        <textarea
          name="content"
          placeholder="Note content…"
          rows={2}
          className="rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <input
          type="url"
          name="url"
          placeholder="https:// (for a link/resource)"
          className="rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <SubmitButton
          pendingText="Saving…"
          className="self-start rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Save
        </SubmitButton>
      </form>

      <div className="mt-3 flex max-h-[32rem] flex-col gap-1.5 overflow-y-auto pr-1">
        {notes.length === 0 && (
          <p className="py-4 text-center text-sm text-ink-soft">No notes or resources yet.</p>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-raised px-3 py-2.5"
          >
            {note.kind === "link" ? (
              <LinkIcon size={15} className="mt-0.5 shrink-0 text-ink-soft" />
            ) : (
              <StickyNote size={15} className="mt-0.5 shrink-0 text-ink-soft" />
            )}
            <div className="min-w-0 flex-1">
              {note.title && <p className="text-sm font-medium text-ink">{note.title}</p>}
              {note.content && <p className="text-sm text-ink-soft">{note.content}</p>}
              {note.url && (
                <a
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent underline underline-offset-2"
                >
                  {note.url}
                </a>
              )}
            </div>
            <form action={deleteNote}>
              <input type="hidden" name="noteId" value={note.id} />
              <input type="hidden" name="revalidatePath" value={revalidatePath} />
              <ConfirmSubmitButton
                confirmMessage="Delete this note?"
                aria-label="Delete note"
                className="rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
              >
                <Trash2 size={14} />
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
