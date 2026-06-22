create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  canonical_key text,
  name text not null,
  symbol text not null,
  asset_type text not null check (asset_type in ('stock', 'crypto')),
  quantity numeric,
  cost_basis numeric,
  purchase_date date,
  thesis text,
  risk_level text check (risk_level is null or risk_level in ('low', 'medium', 'high', 'very_high')),
  time_horizon text check (time_horizon is null or time_horizon in ('short_term', 'medium_term', 'long_term')),
  watch_status text check (watch_status is null or watch_status in ('active', 'watch', 'review', 'exit_candidate')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint holdings_quantity_non_negative check (quantity is null or quantity >= 0),
  constraint holdings_cost_basis_non_negative check (cost_basis is null or cost_basis >= 0),
  constraint holdings_user_canonical_key_unique unique (user_id, canonical_key)
);

create table if not exists public.research_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  holding_id uuid references public.holdings(id) on delete set null,
  symbol text,
  title text not null,
  source_type text not null check (source_type in ('article', 'earnings', 'filing', 'press_release', 'analyst_note', 'podcast', 'video', 'personal_note', 'other')),
  source_url text,
  summary text not null,
  thesis_impact text check (thesis_impact is null or thesis_impact in ('bullish', 'neutral', 'bearish', 'mixed')),
  risk_impact text check (risk_impact is null or risk_impact in ('lower', 'unchanged', 'higher')),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.decision_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  holding_id uuid references public.holdings(id) on delete set null,
  symbol text,
  decision_type text not null check (decision_type in ('buy_consideration', 'hold', 'add', 'trim', 'sell_consideration', 'watch', 'thesis_update', 'risk_review')),
  title text not null,
  reasoning text not null,
  confidence integer check (confidence is null or confidence between 1 and 10),
  risk_level text check (risk_level is null or risk_level in ('low', 'medium', 'high', 'very_high')),
  thesis_snapshot text,
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.thesis_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  holding_id uuid not null references public.holdings(id) on delete cascade,
  symbol text not null,
  thesis_status text not null check (thesis_status in ('intact', 'strengthening', 'weakening', 'broken', 'needs_more_data')),
  summary text not null,
  supporting_evidence text not null default '',
  opposing_evidence text not null default '',
  risk_assessment text not null default '',
  watch_items text not null default '',
  next_review_date date,
  conviction integer check (conviction is null or conviction between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists holdings_user_id_idx on public.holdings(user_id);
create index if not exists holdings_user_symbol_idx on public.holdings(user_id, symbol);
create index if not exists research_notes_user_id_idx on public.research_notes(user_id);
create index if not exists research_notes_holding_id_idx on public.research_notes(holding_id);
create index if not exists decision_journal_entries_user_id_idx on public.decision_journal_entries(user_id);
create index if not exists decision_journal_entries_holding_id_idx on public.decision_journal_entries(holding_id);
create index if not exists thesis_reviews_user_id_idx on public.thesis_reviews(user_id);
create index if not exists thesis_reviews_holding_id_idx on public.thesis_reviews(holding_id);

create or replace trigger holdings_set_updated_at
before update on public.holdings
for each row execute function public.set_updated_at();

create or replace trigger research_notes_set_updated_at
before update on public.research_notes
for each row execute function public.set_updated_at();

create or replace trigger decision_journal_entries_set_updated_at
before update on public.decision_journal_entries
for each row execute function public.set_updated_at();

create or replace trigger thesis_reviews_set_updated_at
before update on public.thesis_reviews
for each row execute function public.set_updated_at();

alter table public.holdings enable row level security;
alter table public.research_notes enable row level security;
alter table public.decision_journal_entries enable row level security;
alter table public.thesis_reviews enable row level security;

create policy "Users can read own holdings"
  on public.holdings for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can insert own holdings"
  on public.holdings for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can update own holdings"
  on public.holdings for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can delete own holdings"
  on public.holdings for delete
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can read own research notes"
  on public.research_notes for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can insert own research notes"
  on public.research_notes for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can update own research notes"
  on public.research_notes for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can delete own research notes"
  on public.research_notes for delete
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can read own journal entries"
  on public.decision_journal_entries for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can insert own journal entries"
  on public.decision_journal_entries for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can update own journal entries"
  on public.decision_journal_entries for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can delete own journal entries"
  on public.decision_journal_entries for delete
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can read own thesis reviews"
  on public.thesis_reviews for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can insert own thesis reviews"
  on public.thesis_reviews for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can update own thesis reviews"
  on public.thesis_reviews for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can delete own thesis reviews"
  on public.thesis_reviews for delete
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
