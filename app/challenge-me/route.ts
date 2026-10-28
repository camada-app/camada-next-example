// SDK-04 demo: force the challenge for this route, whatever the snapshot says. In production
// the same page is served automatically by the middleware for a `challenge` verdict.
// With a render callback, challengeGate serves the challenge to a page load; a browser holding a
// valid `_cch` gets the render as is. An API client (it cannot solve the page) gets the render with
// the middleware's signal applied: `x-camada-challenge: 1` and no-store.
import { challengeGate } from '@camada/next';

const PASSED = `<!doctype html><meta charset="utf-8"><title>Challenge passed</title>
<body style="font-family:system-ui;max-width:40rem;margin:3rem auto">
<h1>Challenge passed</h1>
<p>The <code>_cch</code> cookie is set for an hour. Clear it (or open a private window) to see
the check again.</p>
<p><a href="/">home</a></p>`;

export const GET = (req: Request): Promise<Response> =>
  challengeGate(req, () => new Response(PASSED, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } }));
