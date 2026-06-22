# Intelligent Investment Bot Assistance

An early-stage portfolio research assistant for monitoring holdings, tracking theses, reviewing risk, and keeping a decision journal.

## Purpose

This project is now a small Supabase + Vercel MVP. The first goal is to keep the app deployable, authenticated, persistent, and easy to operate before adding advanced reporting or external API integrations.

## Important disclaimer

This software is for informational and research purposes only. It does not provide financial, investment, legal, tax, or professional advice. Users remain responsible for their own decisions.

## Current MVP direction

Core stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vercel hosting
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Supabase Realtime-ready client subscriptions

External market-data and AI providers are deferred until the Supabase foundation is working end-to-end.

## Canonical starting portfolio

The initial research list is:

- AMD
- ETH
- SOL
- SanDisk
- Applied Materials
- AST SpaceMobile
- Quantum Computing Inc.
- Arm Holdings

The seed data intentionally leaves quantities, cost details, purchase dates, and allocation percentages blank. Do not invent missing portfolio values.

## Supabase data model

User-scoped tables:

```text
public.holdings
public.research_notes
public.decision_journal_entries
public.thesis_reviews
```

Each table includes a `user_id` column tied to `auth.users(id)`. Row Level Security is enabled so authenticated users can only read or modify their own rows.

Schema migration:

```text
supabase/migrations/20260622000000_create_investment_workspace.sql
```

## Local setup

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in the Supabase values:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Supabase setup

1. Create a Supabase project.
2. Enable Google provider under Authentication > Providers.
3. Add your local and production URLs to Authentication > URL Configuration.
4. Apply the SQL migration in `supabase/migrations/20260622000000_create_investment_workspace.sql`.
5. Confirm RLS is enabled on all four public tables.
6. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` locally and in Vercel.

## Vercel setup

1. Import the GitHub repository into Vercel.
2. Keep the framework preset as Next.js.
3. Add the Supabase public environment variables in Project Settings > Environment Variables.
4. Deploy from `main`.
5. Add the deployed Vercel URL to Supabase Auth redirect URLs.

## First MVP boundary

Included:

- Canonical holdings list
- Supabase Auth setup
- Supabase Postgres schema
- Row Level Security policies
- User-specific holdings, notes, journal entries, and thesis reviews
- Manual portfolio review report
- Workspace search and export
- Data quality summary

Excluded for now:

- Brokerage integration
- Automated trading
- Paid external API calls
- Real-time market pricing
- Portfolio calculations without user-entered quantities and values
