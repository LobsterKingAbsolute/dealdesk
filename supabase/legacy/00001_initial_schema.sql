-- LEGACY — not run by Supabase CLI migrations.
-- Superseded by supabase/migrations/00002_day1_schema.sql (profiles, brands, deals, tasks, imports).
-- Kept for reference only. Do not apply on a database that already uses 00002.

-- DealDesk Day 1 schema: user-scoped deals and related records.
-- Apply in Supabase: SQL Editor, or `supabase db push` if using Supabase CLI.

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  brand text,
  status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_user_id_idx on public.deals (user_id);

create table public.deal_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  deal_id uuid not null references public.deals (id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create index deal_tasks_user_id_idx on public.deal_tasks (user_id);
create index deal_tasks_deal_id_idx on public.deal_tasks (deal_id);

create table public.deal_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  deal_id uuid not null references public.deals (id) on delete cascade,
  amount numeric(12, 2),
  currency text not null default 'USD',
  status text not null default 'pending',
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index deal_payments_user_id_idx on public.deal_payments (user_id);
create index deal_payments_deal_id_idx on public.deal_payments (deal_id);

create table public.deal_follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  deal_id uuid not null references public.deals (id) on delete cascade,
  note text,
  follow_up_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index deal_follow_ups_user_id_idx on public.deal_follow_ups (user_id);
create index deal_follow_ups_deal_id_idx on public.deal_follow_ups (deal_id);

alter table public.deals enable row level security;
alter table public.deal_tasks enable row level security;
alter table public.deal_payments enable row level security;
alter table public.deal_follow_ups enable row level security;

create policy "deals_owner" on public.deals
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "deal_tasks_owner" on public.deal_tasks
for all
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.deals d
    where d.id = deal_id and d.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.deals d
    where d.id = deal_id and d.user_id = auth.uid()
  )
);

create policy "deal_payments_owner" on public.deal_payments
for all
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.deals d
    where d.id = deal_id and d.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.deals d
    where d.id = deal_id and d.user_id = auth.uid()
  )
);

create policy "deal_follow_ups_owner" on public.deal_follow_ups
for all
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.deals d
    where d.id = deal_id and d.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.deals d
    where d.id = deal_id and d.user_id = auth.uid()
  )
);
