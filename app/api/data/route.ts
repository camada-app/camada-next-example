import { withCamada } from '@camada/next';

// Wrapped: this route's event carries the real status and dur (proxy.ts leaves it out of the matcher).
export const GET = withCamada(() => Response.json({ ok: true, ts: Date.now() }));
