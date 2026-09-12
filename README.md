# Personal Planner

A personal digital planner — university coursework and personal goals stay
in their own spaces, but show up together on the Dashboard. No forced
deadlines, no hour-by-hour schedule you didn't ask for, and nothing
rearranges your plan without you doing it yourself.

Built with Next.js (App Router, TypeScript), Tailwind CSS v4, and Supabase
(auth + Postgres), styled in a pastel palette called **Blush** with a real
light/dark mode.

## What's in here

- **University** — courses, each with its own color, tasks, assessments
  (with grades and optional due *times*, not just dates), a syllabus/topics
  checklist that drives its progress bar, notes & links, and a weekly class
  schedule. Courses can be archived (hidden, not deleted) once a term ends.
- **Goals** — career, certification, skill, project, health, or habit goals
  with milestones, tasks, notes, and a progress ring that's either
  auto-calculated from your tasks or set by hand — your call, and switching
  back to auto never overwrites what you typed.
- **Tasks & subtasks** — every task (course, goal, or personal) supports
  Must/Should/Could priority, an optional due date *and* a separate
  scheduled date/time, tags, energy level, notes, and subtasks. A task with
  no course, goal, or date lands in the **Inbox** until you organize it.
- **Dashboard** — a greeting, a dismissible short message, quick-add
  (always lands in the Inbox), today's Must/Should/Could, a 7-day strip,
  upcoming deadlines, active goals, and recently completed tasks — each
  card can be hidden from Settings.
- **Planner** — Day, Week, and Month views on one page with a switcher.
  Week view has a drag-and-drop **Inbox strip**: drag a task onto a day to
  schedule it, or drag it back up to unschedule it. The Daily board
  supports drag-and-drop between Must/Should/Could too.
- **Search** — one box, searches courses, goals, and tasks at once.
- **Settings** — theme, display name, week-start day, default Planner view,
  date/time format, sidebar order (reorder with arrows), and which
  Dashboard cards show up.
- **Onboarding** — a short first-run welcome instead of dropping you on an
  empty Dashboard with no context.
- Installable as a PWA (Add to Home Screen on phone/desktop).

## Prerequisites

- [Node.js](https://nodejs.org) 20 or later
- A free [Supabase](https://supabase.com) account

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (any name/region is fine).
2. Once it's ready, open **SQL Editor** in the left sidebar, open a **new query**,
   and run each of these migrations **in order** — paste the whole file's
   contents and run it, then move to the next one:
   1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — the 10 core tables + row-level security
   2. [`supabase/migrations/0002_dashboard_prefs.sql`](supabase/migrations/0002_dashboard_prefs.sql) — the dismissible dashboard message
   3. [`supabase/migrations/0003_task_order.sql`](supabase/migrations/0003_task_order.sql) — manual drag-and-drop ordering
   4. [`supabase/migrations/0004_settings.sql`](supabase/migrations/0004_settings.sql) — dashboard widget show/hide

   `0001_init.sql` is written to be safe to re-run from scratch (it drops
   its own tables before recreating them) if you ever need to reset —
   the other three just add one column each and only need to run once.
3. Open **Settings → API** and copy the **Project URL** and the **anon / public** key.
4. Open **Authentication → Email Templates → Confirm signup**, and replace
   `{{ .ConfirmationURL }}` in the template with:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
   ```
   The default template points at Supabase's own hosted confirmation page,
   which doesn't hand control back to this app — this makes it link to this
   app's `/auth/confirm` route instead, so confirming actually signs you in
   here. Also check **Authentication → URL Configuration**: **Site URL**
   should be `http://localhost:3000` for local dev (update it to your real
   domain after deploying — see below), and included under **Redirect URLs**.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Paste the URL and anon key from step 2 into `.env.local`, **each on one
line** — `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`, not
split across two lines. Never put the `service_role` key in this file, or
in anything prefixed `NEXT_PUBLIC_`.

## 4. Run it

```bash
npm run dev
```

> **Windows note:** if PowerShell refuses to run `npm` with a script-execution
> error, use `npm.cmd run dev` instead, or run
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
> once (your call — it loosens a security setting).

Open [http://localhost:3000](http://localhost:3000). You'll land on **Sign
in** — click through to **Create one**, sign up with an email you control,
and confirm via the email Supabase sends. First time in, you'll get a short
onboarding screen (skippable); after that it's the real Dashboard.

### Testing the core workflows

- **Auth**: sign up → confirm email → land signed in. Sign out, then try
  visiting `/goals` directly — you should bounce to `/login`.
- **University**: add a course → add a task, an assessment (try giving it
  a due *time*), a topic (watch the progress bar move), a note, and a
  class time.
- **Goals**: create a goal → add a milestone and a couple of tasks → watch
  the progress ring move automatically → try switching it to Manual and
  back to Auto.
- **Tasks**: click any task to expand it — edit its fields, add a subtask.
- **Planner**: Day/Week/Month switcher; in Week view, drag a task from one
  day onto another, and drag one up into the Inbox strip to unschedule it.
- **Inbox**: quick-add a task with no date anywhere, confirm it shows up
  on `/inbox`, then use its Organize row to assign it a course/goal/date.
- **Settings**: reorder the sidebar, change date format, hide a Dashboard
  card, and confirm each takes effect immediately.

## Project structure

```
src/
  app/
    (auth)/login, (auth)/signup     — sign in / sign up
    auth/confirm/                   — handles the email confirmation link
    onboarding/                     — first-run welcome (outside the main nav shell)
    (app)/                          — everything behind the sidebar/nav:
      page.tsx                      — Dashboard
      university/, goals/           — overview + [id] detail pages
      planner/                      — Day/Week/Month, one page with ?view=
      inbox/, search/, settings/
    manifest.ts, icon.tsx, apple-icon.tsx,
    icon-192/, icon-512/            — PWA manifest + generated icons
    layout.tsx, globals.css         — fonts, the Blush color tokens, theme wiring
  components/                       — shared UI (task rows, drag-and-drop boards, etc.)
  lib/
    actions/                        — all server actions (one file per feature area)
    supabase/                       — browser/server clients + the auth/onboarding middleware
    format-date.ts                  — date/time formatting per user preference
  proxy.ts                          — Next's middleware convention; session refresh + route gating
supabase/migrations/                — run these in order, see step 2 above
```

## Known limitations (honest, not hidden)

- **Date format** (Settings) only applies on the Dashboard and Goals pages
  right now — task dates elsewhere still show plain ISO-ish dates.
- **Dashboard widgets** can be shown/hidden from Settings, but not
  reordered yet.
- **Drag-and-drop** (Daily board, Week grid) only responds to mouse/touch,
  not keyboard — every drag action has a full non-drag equivalent though
  (checkboxes, the task edit form, Inbox's Organize row), so nothing is
  reachable *only* by dragging.
- No AI assistant — deliberately removed from the plan; see the project's
  design docs for that history if you're curious.
- No Moodle or other external calendar integration yet.

## Deploying

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Go to [vercel.com](https://vercel.com), **New Project**, import the repo.
3. Add the two environment variables in the Vercel project's **Settings →
   Environment Variables** — same names as `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel builds and gives you a `https://your-app.vercel.app` URL.
5. Back in Supabase, update **Authentication → URL Configuration**:
   - **Site URL** → your real Vercel URL
   - Add the same URL under **Redirect URLs**
   Otherwise the email confirmation link will still point at `localhost`.
6. Re-test signup once on the deployed URL to confirm the confirmation
   email link works against the new domain.

Nothing else changes — same Supabase project, same database, same code.

## Suggested future improvements (not built, just ideas)

- Reorder Dashboard cards, not just show/hide them.
- Keyboard support for the drag-and-drop features.
- Apply the date/time format preference everywhere a date shows, not just
  Dashboard and Goals.
- A real Progress & Insights page (charts over time — grades, goal
  completion trends, streaks) — currently a placeholder.
- Drag a task onto the Week grid's Inbox strip *from* the Daily board, or
  vice versa, for a single unified drag surface.
- Moodle iCal feed import for deadlines (see the project's Blueprint doc
  for why this is the recommended approach over the Moodle API).
- Offline support via a service worker — not attempted, since most pages
  need live, authenticated data anyway.
