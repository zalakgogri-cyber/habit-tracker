-- Pivot v1.0 core schema: tiered habits + daily logs.
-- Run this in the Supabase SQL editor for your project (or via `supabase db push`).

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null default 'custom',
  tier1_description text not null,
  tier2_description text not null,
  tier3_description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  tier smallint not null check (tier in (1, 2, 3)),
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index if not exists habit_logs_habit_id_idx on public.habit_logs (habit_id);
create index if not exists habits_user_id_idx on public.habits (user_id);

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

create policy "Users manage their own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own habit logs"
  on public.habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
