import { camada } from '@camada/next';

export default camada();

// /api/data is wrapped in withCamada(), which records it itself: left out here so it is counted once.
export const config = { matcher: ['/((?!_next/|favicon.ico|api/data).*)'] };
