# Deployment preparation verification

Verified locally on 11 November 2026, after SIS implementation commit `fdfebd9`.

- Backend: `uv run pytest -q` with isolated `safestep_test` on port 55433:
  **37 passed**, one pre-existing Starlette/httpx deprecation warning.
- Frontend: `npm test`: **18 passed**, including 14 CR-01 cases and four new
  Vercel configuration tests.
- `npm run lint`, `npm run build`, `git diff --check`: passed.
- Backend Docker image rebuilt successfully.
- A temporary container started with `PORT=8123` and a regular `postgresql://`
  demo-database URI returned HTTP 200 from `/api/health` and `/api/customers`.
  Its health response included `Cache-Control: no-store` and
  `CDN-Cache-Control: no-store`. The temporary container was stopped afterward;
  no application database was deleted.
- Vercel template tests verify API path preservation, no-cache configuration,
  API exclusion from the SPA fallback, URL validation and unchanged template.

**Not yet performed:** creating Railway/Vercel projects, choosing paid provider
resources, generating a real public backend domain, generating the active
`frontend/vercel.json` for that domain, publishing the frontend and executing
hosted browser/API checks. No hosting account credentials were supplied here.

Follow `DEPLOYMENT.md`. Only public deployment origins are needed in chat;
database connection strings, passwords and provider tokens stay in dashboards
or local authenticated CLI sessions.
