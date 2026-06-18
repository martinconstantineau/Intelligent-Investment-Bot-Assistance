# Architecture

## MVP goal

Build a portfolio intelligence assistant for holdings tracking, watchlist management, thesis tracking, research reporting, risk review, and decision journaling.

## Core layers

```text
React/Vite dashboard
  -> API and service layer
  -> Supabase Postgres
  -> Scheduled ingestion jobs
  -> Market data, filings, news, and AI reasoning
```

## Initial modules

- Holdings
- Watchlist
- Investment theses
- Portfolio snapshots
- AI reports
- Risk alerts
- Decision journal

## Design principle

Use deterministic code for calculations and use AI only for summarization, thesis-impact analysis, and research synthesis.
