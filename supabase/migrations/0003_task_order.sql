-- Adds a manual sort position to tasks, for drag-and-drop reordering in the
-- Daily Planner's Must/Should/Could columns. Run this once, same as before.

alter table public.tasks
  add column if not exists order_index int not null default 0;
