# Railway backend + PostgreSQL / Vercel frontend

This deployment is a public **educational demo with simulated data**, not a bank.
The project owner explicitly chose to deploy without adding authentication.
Anyone with the API address can inspect/change demo payments; do not upload real
banking, identity or customer data. No live bank or NAFC connection is configured.

## 1. Railway

1. Sign in at <https://railway.com> using GitHub and grant access to `BEknUur/itm`.
2. Create a project, add **PostgreSQL**, then add a service from that GitHub repo
   in the **same project/environment**. Provider billing/trial availability is
   account-dependent; review any charges before confirming them.
3. In the backend service's settings set **Root Directory** to `/backend`.
   Railway should detect `backend/Dockerfile`. Do not deploy `frontend` here.
4. In that service's **Variables** set:

   ```text
   SAFESTEP_DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

   Select the PostgreSQL reference from Railway's variable picker. If its service
   is named differently, use that name instead of `Postgres`. This is a reference,
   not a password to copy into source code or chat. Normal `postgres://` and
   `postgresql://` URLs are converted to asyncpg automatically.
5. Set **Healthcheck Path** to `/api/health` (timeout 120 seconds is sufficient
   for the demo). Use the Docker image's default start command; it listens on
   Railway's `PORT`, falling back to 8000 locally. Do not override it with a
   hardcoded development `--reload` command.
6. Deploy/redeploy after variables are set. On first start the application creates
   its tables and synthetic customers. The PostgreSQL service stores the data;
   the backend container's filesystem is not the database.
7. **Settings → Networking → Generate Domain**. Open:

   ```text
   https://YOUR-BACKEND.up.railway.app/api/health
   https://YOUR-BACKEND.up.railway.app/docs
   ```

   Health must return `{"status":"ok"}` before continuing. Keep the database
   connection string private; only the public backend origin is needed next.

This guide uses dashboard settings rather than depending on a legacy
`railway.toml` deployment configuration.

## 2. Configure Vercel's /api proxy

Once the real Railway backend origin exists, run from `frontend/`:

```sh
npm run configure:vercel -- https://YOUR-BACKEND.up.railway.app
```

This creates **`frontend/vercel.json`** from `vercel.template.json`, with:

- `/api/:path*` → the same `/api/:path*` on Railway;
- no API caching (payment statuses/audit must remain current);
- a SPA fallback that does not replace API failures with the HTML page.

Commit/push that generated file before the Vercel deployment. There is deliberately
no active placeholder origin in source: deploying the frontend before this step
would leave `/api` unconfigured. No database URL or token belongs in `VITE_*`.

## 3. Vercel

1. Sign in at <https://vercel.com> using GitHub; import `BEknUur/itm`.
2. **Root Directory: `frontend`**, Framework: **Vite**, Node.js: **22.x**.
3. Install: `npm ci`; Build: `npm run build`; Output: `dist`.
   The generated `vercel.json` contains these settings.
4. Deploy `main`. No frontend environment secret is required for the rewrite.
5. Open `https://YOUR-SITE.vercel.app/api/health`. It must return JSON, not HTML.
6. Open the site's client/operator/demo screens and confirm the visible demo label.

Browser calls use the frontend's `/api` origin, so no cross-origin browser CORS
setup is required for this architecture. If making browser calls directly to
Railway instead, configure `SAFESTEP_CORS_ORIGINS` as a JSON array of the exact
frontend origins. CORS is not authentication.

## 4. Hosted verification

After both public URLs exist, verify this **own authorized demo only**:

```sh
cd qa
npm ci
npx playwright install firefox
ALLOW_REMOTE_DEMO=1 API_URL=https://YOUR-BACKEND.up.railway.app npm run test:api
ALLOW_REMOTE_DEMO=1 APP_URL=https://YOUR-SITE.vercel.app API_URL=https://YOUR-BACKEND.up.railway.app npm test
```

These tests create simulated records; they never clear the database. The browser
suite checks transfers, holds, reasons, prefix/status filters, actual polling,
warning failure/Retry, audit, RU/KZ and mobile behaviour. Screenshots and JSON
results identify the URLs actually tested. If Vercel's deployment protection is
enabled, use an authorized accessible demo domain or configure access in Vercel;
do not confuse its login page with a passing application test.

**Prepared locally is not deployed:** do not mark Railway/Vercel deployment or
hosted tests complete until real domains and provider deployment results exist.
