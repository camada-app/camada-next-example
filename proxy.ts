import { camada } from '@camada/next';

export default camada();

// /api/data is wrapped in withCamada(), which records it itself: left out here so it is counted once.
// The `$` makes the exclusion exact. Without it, /api/database and /api/data-export would skip camada too.
export const config = { matcher: ['/((?!_next/|favicon.ico|api/data$).*)'] };
