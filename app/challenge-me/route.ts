// SDK-04 demo: force the challenge for this route, whatever the snapshot says. In production
// the same page is served automatically by the middleware for a `challenge` verdict.
// challengeGate returns null once the browser holds a valid `_cch` cookie.
import { challengeGate } from '@camada/next';

const PASSED = `<!doctype html><meta charset="utf-8"><title>Challenge passed</title>
<body style="font-family:system-ui;max-width:40rem;margin:3rem auto">
<h1>Challenge passed</h1>
<p>The <code>_cch</code> cookie is set for an hour. Clear it (or open a private window) to see
the check again.</p>
<p><a href="/">home</a></p>`;

export async function GET(req: Request): Promise<Response> {
  const gate = await challengeGate(req);
  if (gate) return gate;
  return new Response(PASSED, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
