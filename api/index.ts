import { attachDatabasePool } from '@vercel/functions';
import { createRuntime } from '../server/runtime.js';

// One pool/application per warm instance, shared across concurrent API routes.
// Importing this module never starts a listener or reads a local .env file.
let runtime: ReturnType<typeof createRuntime> | undefined;

export default {
  fetch(request: Request) {
    try {
      runtime ??= createRuntime(process.env, attachDatabasePool);
    } catch {
      // Do not log the rejected configuration, database URL, token or request body.
      console.error('KodeArcade API initialization failed; check server configuration');
      return Response.json({ error: 'Service unavailable' }, {
        status: 503,
        headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
      });
    }
    // Keep the original URL, query, body, headers and every Set-Cookie intact.
    return runtime.app.fetch(request);
  },
};
