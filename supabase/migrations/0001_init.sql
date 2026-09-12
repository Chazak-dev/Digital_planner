-- Personal Planner — initial schema
-- Run this once in your Supabase project's SQL Editor (or via `supabase db push`
-- if you're using the Supabase CLI). Matches the 10-table design from Phase 3.
--
-- Safe to run more than once: it drops everything it's about to create
-- first, then rebuilds from a clean slate — so a previous partial attempt,
-- or just wanting to reset during development, can't cause "already exists"
-- errors. Wrapped in a transaction too, so a failure midway rolls back the
-- whole thing instead of leaving things half-created.

begin;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop trigger if exists tasks_set_updated_at on public.tasks;
drop function if exists public.set_updated_at();

drop table if exists public.notes cascade;
drop table if exists public.tasks cascade;
drop table if exists public.progress_history cascade;
drop table if exists public.milestones cascade;
drop table if exists public.goals cascade;
drop table if exists public.class_schedule cascade;
drop table if exists public.assessments cascade;
drop table if exists public.course_topics cascade;
drop table if exists public.courses cascade;
drop table if exists public.profiles cascade;

-- ============================================================================
-- profiles — one row per user, holds preferences
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  week_start_day smallint not null default 1 check (week_start_day between 0 and 6),
  date_format text not null default 'MM/DD/YYYY',
  time_format text not null default '12h',
  default_daily_view text not null default 'day',
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  nav_order jsonb not null default '["dashboard","university","goals","planner","inbox","insights","settings"]',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- University space
-- ============================================================================
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  code text,
  color text not null default '#c96a87',
  term_start date,
  term_end date,
  credit_hours numeric,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.course_topics (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  order_index int not null default 0,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'done')),
  created_at timestamptz not null default now()
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  type text not null check (type in ('assignment', 'project', 'exam', 'quiz')),
  title text not null,
  due_date timestamptz,
  grade_earned numeric,
  grade_possible numeric,
  status text not null default 'upcoming' check (status in ('upcoming', 'in_progress', 'submitted', 'graded')),
  created_at timestamptz not null default now()
);

create table public.class_schedule (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  location text
);

-- ============================================================================
-- Personal & Goals space
-- ============================================================================
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text not null check (
    category in ('career', 'certification', 'skill', 'project', 'health', 'habit', 'other')
  ),
  color text not null default '#c96a87',
  icon text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'active' check (status in ('flexible', 'active', 'paused', 'completed')),
  deadline date,
  progress_percent numeric not null default 0,
  progress_mode text not null default 'auto' check (progress_mode in ('auto', 'manual')),
  created_at timestamptz not null default now()
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  title text not null,
  order_index int not null default 0,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'done')),
  weight numeric,
  created_at timestamptz not null default now()
);

create table public.progress_history (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  percent numeric not null,
  note text
);

-- ============================================================================
-- Shared backbone
-- ============================================================================
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  notes text,
  area text not null check (area in ('university', 'personal')),
  course_id uuid references public.courses (id) on delete set null,
  goal_id uuid references public.goals (id) on delete set null,
  milestone_id uuid references public.milestones (id) on delete set null,
  parent_task_id uuid references public.tasks (id) on delete cascade,
  priority text not null default 'should' check (priority in ('must', 'should', 'could')),
  status text not null default 'inbox' check (
    status in ('inbox', 'planned', 'in_progress', 'done', 'skipped', 'cancelled')
  ),
  due_date date,
  scheduled_date date,
  scheduled_time time,
  estimated_minutes int,
  energy_level text check (energy_level in ('low', 'medium', 'high')),
  tags text[] not null default '{}',
  recurrence_rule jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  owner_type text not null check (owner_type in ('course', 'goal')),
  owner_id uuid not null,
  kind text not null default 'note' check (kind in ('note', 'link')),
  title text,
  content text,
  url text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row-level security — every table, scoped to the owning user
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_topics enable row level security;
alter table public.assessments enable row level security;
alter table public.class_schedule enable row level security;
alter table public.goals enable row level security;
alter table public.milestones enable row level security;
alter table public.progress_history enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own courses" on public.courses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own course_topics" on public.course_topics
  for all using (
    exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())
  );

create policy "own assessments" on public.assessments
  for all using (
    exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())
  );

create policy "own class_schedule" on public.class_schedule
  for all using (
    exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())
  );

create policy "own goals" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own milestones" on public.milestones
  for all using (
    exists (select 1 from public.goals g where g.id = goal_id and g.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.goals g where g.id = goal_id and g.user_id = auth.uid())
  );

create policy "own progress_history" on public.progress_history
  for all using (
    exists (select 1 from public.goals g where g.id = goal_id and g.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.goals g where g.id = goal_id and g.user_id = auth.uid())
  );

create policy "own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own notes" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
