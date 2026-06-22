-- Add composite indexes for faster filtering on common queries
-- Fixes: Missing database indexes on common queries

create index if not exists holdings_user_holding_idx on public.holdings(user_id, symbol);
create index if not exists research_notes_user_holding_idx on public.research_notes(user_id, holding_id);
create index if not exists research_notes_user_symbol_idx on public.research_notes(user_id, symbol);
create index if not exists decision_journal_user_holding_idx on public.decision_journal_entries(user_id, holding_id);
create index if not exists decision_journal_user_symbol_idx on public.decision_journal_entries(user_id, symbol);
create index if not exists thesis_reviews_user_holding_idx on public.thesis_reviews(user_id, holding_id);
create index if not exists thesis_reviews_user_symbol_idx on public.thesis_reviews(user_id, symbol);
