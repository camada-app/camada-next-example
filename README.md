# camada-next-example

A minimal Next.js app-router app running [`@camada/next`](../camada-next): blocklist
enforcement in `proxy.ts`, the first-party beacon served from `/api/camada/*`, and
`<CamadaBeacon/>` in the layout `<head>` carrying the request's `rid`.

The integration is three files:

- `proxy.ts` — `export default camada()` (on Next ≤15 the same file is named
  `middleware.ts`; the naming difference is the only difference)
- `app/api/camada/[...camada]/route.ts` — `export const { GET, POST } = camadaRoute()`
- `app/layout.tsx` — `<CamadaBeacon/>` in `<head>`

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
3. **Fail open.** Kill the analyst (stop `npm run dev` in edge-analyst) and reload — the
   app keeps serving normally. camada never takes the customer's app down; a dead analyst
   costs only dropped telemetry. `CAMADA_DISABLED=1` in `.env` bypasses the SDK entirely.

## Notes

- The login page (`/login`, try `admin` / `hunter2`) is deliberately plain: the server
  action just answers success/failure. App-context event tracking (`login_failed` etc.) is
  a `@camada/node` feature today; the Next.js app-context surface lands later.
- `next.config.mjs` widens Turbopack's root one directory up so it resolves through the
  `file:` symlinks to the sibling checkouts — not needed once `@camada/next` installs from
  npm.
