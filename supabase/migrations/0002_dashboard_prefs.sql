-- Adds the one preference the Dashboard needs that 0001 didn't have yet:
-- whether to show the short personalized message under the greeting.
-- Run this once in the SQL Editor, same as 0001.

alter table public.profiles
  add column if not exists show_motivational_message boolean not null default true;
