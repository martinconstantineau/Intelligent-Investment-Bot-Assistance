create extension if not exists pgcrypto;

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  name text,
  asset_type text not null check (asset_type in ('stock', 'crypto', 'etf', 'cash', 'other')),
  quantity numeric(20, 8) not null default 0,
  average_cost numeric(20, 4) not null default 0,
  currency text not null default 'CAD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  name text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.investment_theses (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  bull_case text not null,
  bear_case text not null,
  thesis_break_conditions text not null,
  confidence_score int not null check (confidence_score between 1 and 10),
  last_reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  symbol text,
  report_type text not null,
  summary text not null,
  thesis_impact text not null check (thesis_impact in ('bullish', 'neutral', 'bearish')),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  suggested_action text not null check (suggested_action in ('accumulate', 'hold', 'monitor', 'reduce', 'exit')),
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  portfolio_value numeric(20, 4) not null default 0,
  cash_value numeric(20, 4) not null default 0,
  daily_change numeric(20, 4),
  created_at timestamptz not null default now(),
  unique (snapshot_date)
);

create table if not exists public.decision_journal (
  id uuid primary key default gen_random_uuid(),
  symbol text,
  decision text not null,
  reasoning text not null,
  confidence int check (confidence between 1 and 10),
  outcome text,
  created_at timestamptz not null default now()
);

create index if not exists holdings_symbol_idx on public.holdings (symbol);
create index if not exists watchlist_symbol_idx on public.watchlist (symbol);
create index if not exists investment_theses_symbol_idx on public.investment_theses (symbol);
create index if not exists ai_reports_symbol_idx on public.ai_reports (symbol);
create index if not exists decision_journal_symbol_idx on public.decision_journal (symbol);
