# Database Plan

## Initial tables

### holdings

Tracks owned assets.

Fields:

- id
- symbol
- asset_type
- quantity
- average_cost
- created_at
- updated_at

### watchlist

Tracks assets under observation.

Fields:

- id
- symbol
- notes
- created_at

### investment_theses

Stores bull case, bear case, and thesis break conditions.

Fields:

- id
- symbol
- bull_case
- bear_case
- thesis_break_conditions
- confidence_score
- updated_at

### ai_reports

Stores generated research and thesis-impact reports.

Fields:

- id
- symbol
- report_type
- content
- created_at

### portfolio_snapshots

Stores daily portfolio-level snapshots.

Fields:

- id
- snapshot_date
- portfolio_value
- cash_value
- daily_change

### decision_journal

Stores every recommendation and investment decision.

Fields:

- id
- symbol
- decision
- reasoning
- confidence
- created_at
