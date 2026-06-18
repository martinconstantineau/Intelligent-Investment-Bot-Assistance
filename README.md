# Intelligent Investment Bot Assistance

An early-stage investment intelligence assistant for portfolio monitoring, thesis tracking, market research, risk review, and decision journaling.

## Purpose

This project is intended to support structured investment research and portfolio decision-making. The goal is to help track holdings, watchlists, investment theses, market events, AI-generated research reports, and decision history.

## Important disclaimer

This software is for informational and research purposes only. It does not provide financial, investment, legal, tax, or professional advice. Users are responsible for their own investment decisions.

## Current MVP modules

- Dashboard
- Portfolio holdings view
- Watchlist
- Investment research view
- AI reports view
- Settings page
- Decision journal view
- Supabase schema migration
- Supabase client/server helpers

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Vercel
- Recharts
- Market data APIs
- AI reasoning layer

## Local setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values.

Required for Supabase-backed API routes:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Database

The initial schema is in:

```text
supabase/migrations/0001_initial_schema.sql
```

Do not apply this migration to an unrelated production database. Use a dedicated Supabase project for this investment bot.
