import { Trash2, Link as LinkIcon, StickyNote } from "lucide-react";
import { deleteNote, updateNote } from "@/lib/actions/notes";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton } from "@/components/submit-button";
import type { Note } from "@/lib/types";

/** A single note/link row with an expandable edit form — shared by the Goals and University note lists. */
export function NoteRow({ note, revalidatePath }: { note: Note; revalidatePath: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-raised px-3 py-2.5">
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

        <details className="mt-1.5 group">
          <summary className="cursor-pointer list-none text-xs font-medium text-ink-soft hover:text-accent [&::-webkit-details-marker]:hidden">
            Edit
          </summary>
          <form action={updateNote} className="mt-2 flex flex-col gap-2">
            <input type="hidden" name="noteId" value={note.id} />
            <input type="hidden" name="revalidatePath" value={revalidatePath} />
            <input
              type="text"
              name="title"
              placeholder="Title (optional)"
              defaultValue={note.title ?? ""}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <textarea
              name="content"
              placeholder="Note content…"
              defaultValue={note.content ?? ""}
              rows={2}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <input
              type="url"
              name="url"
              placeholder="https:// (for a link)"
              defaultValue={note.url ?? ""}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <SubmitButton
              pendingText="Saving…"
              className="self-start rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              Save changes
            </SubmitButton>
          </form>
        </details>
      </div>

      <form action={deleteNote}>
        <input type="hidden" name="noteId" value={note.id} />
        <input type="hidden" name="revalidatePath" value={revalidatePath} />
        <ConfirmSubmitButton
          confirmMessage="Delete this note?"
          aria-label="Delete note"
          className="shrink-0 rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
        >
          <Trash2 size={14} />
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
