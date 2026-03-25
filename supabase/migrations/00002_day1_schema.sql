-- DealDesk Day 1 — profiles, brands, deals, tasks, imports + RLS
--
-- INCOMPATIBLE with 00001_initial_schema.sql on the same database:
-- both define public.deals with different columns and related tables.
-- Applying 00001 then 00002 on a fresh DB will fail at CREATE TABLE deals.
--
-- Use ONE path:
--   • New / reset DB: apply only this migration (skip or remove 00001 from the chain).
--   • DB already migrated with 00001: do not run this file as-is; write a custom migration.
--
-- Paste-safe for Supabase SQL Editor if you are not using the migration runner.

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  contact_name text,
  contact_email text,
  created_at timestamptz default now()
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  brand_id uuid references public.brands (id) on delete set null,
  title text not null,
  status text not null default 'lead',
  amount_cents integer,
  currency text default 'USD',
  deliverable_summary text,
  content_due_at timestamptz,
  invoice_sent_at timestamptz,
  payment_terms_days integer,
  payment_due_at timestamptz,
  paid_at timestamptz,
  next_action_at timestamptz,
  next_action_note text,
  source_type text default 'manual',
  source_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  deal_id uuid references public.deals (id) on delete cascade,
  type text not null,
  title text not null,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table public.imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  raw_text text not null,
  parsed_json jsonb,
  status text not null default 'pending',
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index brands_user_id_idx on public.brands (user_id);
create index deals_user_id_idx on public.deals (user_id);
create index deals_brand_id_idx on public.deals (brand_id);
create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_deal_id_idx on public.tasks (deal_id);
create index imports_user_id_idx on public.imports (user_id);

-- -----------------------------------------------------------------------------
-- Row level security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.deals enable row level security;
alter table public.tasks enable row level security;
alter table public.imports enable row level security;

-- profiles (PK = auth user)
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- brands
create policy "brands_all_own"
  on public.brands for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- deals: own rows; optional brand must belong to same user
create policy "deals_select_own"
  on public.deals for select
  using (auth.uid() = user_id);

create policy "deals_insert_own"
  on public.deals for insert
  with check (
    auth.uid() = user_id
    and (
      brand_id is null
      or exists (
        select 1 from public.brands b
        where b.id = brand_id and b.user_id = auth.uid()
      )
    )
  );

create policy "deals_update_own"
  on public.deals for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      brand_id is null
      or exists (
        select 1 from public.brands b
        where b.id = brand_id and b.user_id = auth.uid()
      )
    )
  );

create policy "deals_delete_own"
  on public.deals for delete
  using (auth.uid() = user_id);

-- tasks: own rows; if deal_id set, deal must belong to same user
create policy "tasks_select_own"
  on public.tasks for select
  using (
    auth.uid() = user_id
    and (
      deal_id is null
      or exists (
        select 1 from public.deals d
        where d.id = deal_id and d.user_id = auth.uid()
      )
    )
  );

create policy "tasks_insert_own"
  on public.tasks for insert
  with check (
    auth.uid() = user_id
    and (
      deal_id is null
      or exists (
        select 1 from public.deals d
        where d.id = deal_id and d.user_id = auth.uid()
      )
    )
  );

create policy "tasks_update_own"
  on public.tasks for update
  using (
    auth.uid() = user_id
    and (
      deal_id is null
      or exists (
        select 1 from public.deals d
        where d.id = deal_id and d.user_id = auth.uid()
      )
    )
  )
  with check (
    auth.uid() = user_id
    and (
      deal_id is null
      or exists (
        select 1 from public.deals d
        where d.id = deal_id and d.user_id = auth.uid()
      )
    )
  );

create policy "tasks_delete_own"
  on public.tasks for delete
  using (
    auth.uid() = user_id
    and (
      deal_id is null
      or exists (
        select 1 from public.deals d
        where d.id = deal_id and d.user_id = auth.uid()
      )
    )
  );

-- imports
create policy "imports_all_own"
  on public.imports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
