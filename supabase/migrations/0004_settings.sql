-- Adds dashboard widget visibility preferences. Run this once, same as before.

alter table public.profiles
  add column if not exists dashboard_widgets jsonb not null default
    '{"priorities":true,"week":true,"deadlines":true,"goals":true,"completed":true}'::jsonb;
