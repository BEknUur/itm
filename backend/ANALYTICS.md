# Fraud Operations Analytics (demo)

`GET /api/agent/analytics?start_date=2026-01-01&end_date=2026-01-07`

- Optional bounds are ISO `YYYY-MM-DD` dates, inclusive in UTC. Each omitted
  bound defaults independently: start = today UTC minus six days; end = today UTC.
  With no parameters this is seven UTC calendar dates, including today.
- Invalid dates, reversed ranges, and more than 366 inclusive dates return 422.
- The cohort contains payments **created** during these dates. All daily buckets
  use the UTC creation date, ascending, including zero-activity dates.
- `total_payments`: all cohort payments. `held_payments`: cohort payments with
  non-null `hold_until`, including released/cancelled holds. `current_held`:
  cohort payments whose current status is `HELD`.
- `released_payments` / `cancelled_payments`: cohort payments with these current
  statuses, even when their decision occurred after the selected dates.
  `cancelled_amount` sums amounts of currently cancelled cohort payments (KZT).
- Daily `total`, `held`, `released`, `cancelled` follow the same definitions.
- `average_resolution_seconds`: mean of (first `RELEASED` or `CANCELLED` audit
  event timestamp minus creation) for resolved, originally held cohort payments.
  Decisions outside the date interval still count. Missing decision events are
  excluded; no eligible timestamps yields JSON `null`. Repeated events do not
  overweight a payment. Audit timestamps are assumed valid.

## Limitations

These are operational workflow counts, **not confirmed fraud, prevented losses,
or verified false positives**. Cancellation/release does not establish ground
truth. This demo adds no authentication or authorization. Money uses the
existing floating-point payment model; this is not settlement accounting.

The read-only application use case reuses payment/audit ports and aggregates in
memory for the MVP. It loads all payments and, if necessary, all audit events;
the date cap limits output buckets, not database scan size. Reads are separate
queries and are not a guaranteed point-in-time snapshot under concurrent
decisions. Larger deployments need database-side cohort aggregation, indexes,
and defined snapshot consistency. Original hold membership relies on retained
`hold_until`; historical rows without it cannot reconstruct original holds.

## Tests

Integration fixtures drop tables. Only databases named `safestep_test` or
`safestep_sis1011_test` are accepted; never supply a production URL.

```sh
SAFESTEP_TEST_DATABASE_URL=postgresql+asyncpg://safestep:safestep@localhost:5433/safestep_sis1011_test uv run pytest
```
