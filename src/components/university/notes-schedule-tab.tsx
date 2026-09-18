import { Trash2 } from "lucide-react";
import { createNote } from "@/lib/actions/notes";
import { createClassSlot, deleteClassSlot, updateClassSlot } from "@/lib/actions/class-schedule";
import { NoteRow } from "@/components/note-row";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton } from "@/components/submit-button";
import type { Note, ClassSlot } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function NotesScheduleTab({
  courseId,
  notes,
  schedule,
}: {
  courseId: string;
  notes: Note[];
  schedule: ClassSlot[];
}) {
  const revalidatePath = `/university/${courseId}`;
  const sortedSchedule = [...schedule].sort((a, b) =>
    a.day_of_week === b.day_of_week
      ? a.start_time.localeCompare(b.start_time)
      : a.day_of_week - b.day_of_week,
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-display text-base font-semibold text-ink">Class schedule</h3>
        <p className="mt-1 text-sm text-ink-soft">Recurring weekly class times.</p>

        <form action={createClassSlot} className="mt-3 flex flex-wrap items-center gap-2">
          <input type="hidden" name="courseId" value={courseId} />
          <select
            name="dayOfWeek"
            defaultValue="1"
            className="rounded-lg border border-border bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            name="startTime"
            required
            className="rounded-lg border border-border bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <input
            type="time"
            name="endTime"
            required
            className="rounded-lg border border-border bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <input
            type="text"
            name="location"
            placeholder="Location (optional)"
            className="min-w-0 flex-1 rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <SubmitButton
            pendingText="Adding…"
            className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Add
          </SubmitButton>
        </form>

        <div className="mt-3 flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
          {sortedSchedule.map((slot) => (
            <details key={slot.id} className="rounded-lg border border-border bg-raised px-3 py-2 group">
              <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                <span className="w-9 text-sm font-medium text-ink">{DAYS[slot.day_of_week]}</span>
                <span className="text-sm text-ink-soft">
                  {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                </span>
                {slot.location && (
                  <span className="flex-1 truncate text-sm text-ink-soft">{slot.location}</span>
                )}
                <form action={deleteClassSlot} className="ml-auto">
                  <input type="hidden" name="slotId" value={slot.id} />
                  <input type="hidden" name="courseId" value={courseId} />
                  <ConfirmSubmitButton
                    confirmMessage="Remove this class time?"
                    aria-label="Delete class time"
                    className="rounded-md p-1 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                  >
                    <Trash2 size={14} />
                  </ConfirmSubmitButton>
                </form>
              </summary>

              <form
                action={updateClassSlot}
                className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border pt-2.5"
              >
                <input type="hidden" name="slotId" value={slot.id} />
                <input type="hidden" name="courseId" value={courseId} />
                <select
                  name="dayOfWeek"
                  defaultValue={slot.day_of_week}
                  className="rounded-lg border border-border bg-paper px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent"
                >
                  {DAYS.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  name="startTime"
                  defaultValue={slot.start_time.slice(0, 5)}
                  required
                  className="rounded-lg border border-border bg-paper px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent"
                />
                <input
                  type="time"
                  name="endTime"
                  defaultValue={slot.end_time.slice(0, 5)}
                  required
                  className="rounded-lg border border-border bg-paper px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent"
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location (optional)"
                  defaultValue={slot.location ?? ""}
                  className="min-w-0 flex-1 rounded-lg border border-border bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
                />
                <SubmitButton
                  pendingText="Saving…"
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
                >
                  Save
                </SubmitButton>
              </form>
            </details>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-base font-semibold text-ink">Notes &amp; links</h3>

        <form action={createNote} className="mt-3 flex flex-col gap-2">
          <input type="hidden" name="ownerType" value="course" />
          <input type="hidden" name="ownerId" value={courseId} />
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
            placeholder="https:// (for a link)"
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
            <p className="py-4 text-center text-sm text-ink-soft">No notes or links yet.</p>
          )}
          {notes.map((note) => (
            <NoteRow key={note.id} note={note} revalidatePath={revalidatePath} />
          ))}
        </div>
      </div>
    </div>
  );
}
