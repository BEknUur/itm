# SafeStep browser verification

These checks use **simulated payments only**. By default they permit local URLs.
They create demonstration
records but never clear the application database. Do not run them against a real
bank deployment. Results are written into `SIS 10-11/evidence/`.

For your own hosted Railway/Vercel demo, explicitly set `ALLOW_REMOTE_DEMO=1`
and supply its HTTPS `APP_URL` / `API_URL`; see `DEPLOYMENT.md`. This opt-in is not
application authentication and does not permit testing a third-party site.

## Setup

```sh
cd qa
npm ci
npx playwright install firefox
```

Use the Firefox version installed by Playwright. If a compatible browser already
exists, `PLAYWRIGHT_FIREFOX_EXECUTABLE=/absolute/path/to/firefox` is an optional
override. No browser executable or npm dependencies are checked into Git.

## Current product

Start the application first, then run:

```sh
APP_URL=http://localhost:13000 API_URL=http://localhost:18001 npm test
API_URL=http://localhost:18001 npm run test:api
```

The full current-product check verifies the documented CR-01 prefix/status
behaviour, warning recovery, active-payment recovery and responsive demo screens.
Read `after-browser-results.json` for actual results; source code alone is not
evidence that a check passed.

The API smoke checks cover the three main workflows from the submission: payment
scoring/holds, simulated customer step-up, and operator resolution/audit. They
also exercise all eight blank-reason combinations directly over HTTP and assert
that rejected requests leave the payment, audit and mock incident outbox unchanged.
They create additional simulated records in the demo database and do not count
as the historical 18-test pytest suite in the team's Word report.

## Baseline reproduction

`npm run baseline` is intended **only for the original UI at commit `2115a8c`**, not
the redesigned application. Serve that checkout with its original backend, with
the frontend proxy pointing to that backend:

```sh
BASELINE_URL=http://localhost:4173 npm run baseline
```

It captures the original screen, reproduces the loss of the active hold after a
page reload, and intercepts a warning GET with HTTP 503. This is an injected test
failure, not a claim that a bank service suffered an outage.

## Evidence provenance

- `before-*.png` and `baseline-browser-results.json`: original source checkout.
- `baseline-backend-tests.txt`: original Docker image and a separate test database.
- `after-*.png` and `after-browser-results.json`: updated working product.
- `historical-warning-before.mp4`: original embedded H.264 video from slide 4 of
  the team's presentation, remuxed from MOV to MP4 without changing the frames.
  Its 3.13-second recording alone does not prove backend availability.

Screenshots already embedded in the team's Word/PowerPoint files describe their
earlier demonstration dataset. Do not expect their historical counts (31, 27,
20, 8) to match a fresh local database or the updated UI.
