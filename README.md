# camada-next-example

A minimal Next.js app-router app running [`@camada/next`](../camada-next): blocklist
enforcement in `proxy.ts`, the first-party beacon served from `/api/camada/*`, and
`<CamadaBeacon/>` in the layout `<head>` carrying the request's `rid`.

The integration is three files:

- `proxy.ts` — `export default camada()` (on Next ≤15 the same file is named
  `middleware.ts`; the naming difference is the only difference)
- `app/api/camada/[...camada]/route.ts` — `export const { GET, POST } = camadaRoute()`
- `app/layout.tsx` — `<CamadaBeacon/>` in `<head>`

Plus one optional wrapper: `app/api/data/route.ts` exports `GET = withCamada(handler)`, so its
events carry the real status and `dur` (the middleware ships pre-response, without either).
`proxy.ts` leaves exactly `/api/data` out of its matcher (`api/data$`) so the request is
recorded once. The `$` matters: without it `/api/database` would skip camada too.

## Setup

The `@camada/*` packages are `file:` dependencies on sibling checkouts — build them
bottom-up once:

```bash
for d in camada-core camada-browser camada-react camada-next; do
  (cd ../$d && npm install && npm run build)
done
```

Then:

```bash
cp .env.example .env       # points at a local edge-analyst (npm run dev in camada/edge-analyst -> :8787)
npm install
npm run dev                # -> http://localhost:3001
```

## Hand-test walkthrough

1. **Beacon + rid join.** Browse http://localhost:3001 with devtools open. Network shows
   `GET /api/camada/b.js?r=<uuid>` (the beacon script, served first-party) followed by
   `POST /api/camada/fp` → 204. The `r` value equals the `x-rid` response header on the
   document request — that is the server event ↔ browser fingerprint join.
2. **Inline blocking.** Publish blocks first (`npm run seed` in `camada/edge-analyst`
   compiles a snapshot containing `203.0.113.66`), then:
   ```bash
   curl -i -H 'X-Forwarded-For: 203.0.113.66' http://localhost:3001/
   ```
   → `403 Forbidden` with `x-block-reason` and `x-block-version` headers. (XFF is only
   honored because `.env` sets `CAMADA_TRUSTED_PROXY=hops:1`; without a trusted-proxy
   config a spoofed XFF is ignored by design.)
3. **Status and duration.** `curl -i http://localhost:3001/api/data` — the analyst's raw
   event for it has `st: 200` and a `dur` in ms; a page such as `/` ships `st` and `dur` null
   from the middleware. `curl -i http://localhost:3001/api/database` is still matched: it
   answers with an `x-rid` header (the middleware ran), which `/api/data` doesn't.
4. **Fail open.** Kill the analyst (stop `npm run dev` in edge-analyst) and reload — the
   app keeps serving normally. camada never takes the customer's app down; a dead analyst
   costs only dropped telemetry. `CAMADA_DISABLED=1` in `.env` bypasses the SDK entirely.

## Notes

- The login page (`/login`, try `admin` / `hunter2`) is deliberately plain: the server
  action just answers success/failure. App-context event tracking (`login_failed` etc.) is
  a `@camada/node` feature today; the Next.js app-context surface lands later.
- `next.config.mjs` widens Turbopack's root one directory up so it resolves through the
  `file:` symlinks to the sibling checkouts — not needed once `@camada/next` installs from
  npm.
- In a factory pool slot the `@camada/*` siblings are symlinks to symlinks, which
  Turbopack can't resolve (`Can't resolve '@camada/core'`, every request 500s). Widening the
  root doesn't help; run `npx next dev --webpack -p 3001` there instead.

## Challenge (SDK-04)

`/challenge-me` forces the first-party proof-of-work challenge, whatever the snapshot says — the
same page the middleware serves automatically for a `challenge` verdict on snapshot v4. The
route calls `challengeGate(req, render)`, which returns the challenge Response, or the render once
the browser holds a valid `_cch` cookie, or (signalled) when the request is not a page load.

1. Browse `http://localhost:3001/challenge-me` — "Checking your browser" appears, the inline
   solver hunts a SHA-256 with 16 leading zero bits (tens of milliseconds), the hidden form
   posts to `/api/camada/challenge`, and the browser lands on "Challenge passed". Devtools shows
   the `_cch` cookie (`HttpOnly`, `SameSite=Lax`, one hour); reload and the page renders at once.
2. `curl -i http://localhost:3001/challenge-me -H 'accept: text/html' -H 'sec-fetch-dest: document'`
   → **403** with `x-camada-challenge: 1` and the page in the body.
3. A request without an HTML `Accept` (an API client, an image, a fetch) cannot solve a challenge,
   so the route renders (**200**) with the same signal the middleware gives such a request under
   a `challenge` verdict from the snapshot: `x-camada-challenge: 1` and `cache-control: no-store`.
   The app or client decides what to do.
   `curl -i http://localhost:3001/challenge-me -H 'accept: application/json'`
4. The events tell the three apart: a served challenge ships `st: 403, blk: "challenge"`, a passed
   one ships `st: 200, ch: 1`, and a signalled one (step 3) ships `st: 200, chs: 1`.

The nonce and the cookie are bound to the client IP, so camada serves no challenge to a request
it cannot identify — at the edge that means no trusted-proxy config and no `X-Forwarded-For`.
