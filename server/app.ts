import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { bodyLimit } from 'hono/body-limit';
import type { Auth } from './auth.js';
import type { ServerConfig } from './config.js';
import type { Database } from './db/client.js';
import { createAccountRoutes } from './account.js';
import { createClassroomRoutes } from './classrooms.js';
import { createStudentRoutes } from './student.js';
import { createProgressRoutes } from './progress.js';
import { createSchoolRoutes } from './schools.js';
import { createFamilyRoutes } from './family.js';

export function createApp(auth: Pick<Auth, 'handler'>, config: Pick<ServerConfig, 'APP_ORIGIN'> & Partial<Pick<ServerConfig, 'BETTER_AUTH_SECRET'>>, accounts?: { auth: Auth; db: Database }) {
  const app = new Hono();
  app.use('*', secureHeaders());
  app.use('/api/*', async (c, next) => { c.header('Cache-Control', 'no-store'); await next(); });
  app.use('/api/*', async (c, next) => bodyLimit({ maxSize: c.req.path.startsWith('/api/student/progress/') ? 1024 * 1024 : /^\/api\/manage\/classes\/[^/]+\/students\/import$/.test(c.req.path) ? 64 * 1024 : 16 * 1024, onError: c => c.json({ error: 'Payload too large' }, 413) })(c, next));
  app.use('/api/*', async (c, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
      if (c.req.header('Origin') !== config.APP_ORIGIN || c.req.header('Sec-Fetch-Site') === 'cross-site') {
        return c.json({ error: 'Forbidden' }, 403);
      }
    }
    await next();
  });
  app.get('/api/health', c => c.json({ status: 'ok', phase: 'foundation' }));
  const classrooms = Boolean(accounts && config.BETTER_AUTH_SECRET);
  app.get('/api/capabilities', c => c.json({ adultAccounts: Boolean(accounts), classroomLogin: classrooms, classManagement: classrooms, learnerManagement: classrooms, pdfCards: classrooms, cloudProgress: classrooms, homeLearning: classrooms }));
  // Deliberate allowlist. Do not mount all Better Auth routes before adult/learner guards,
  // mail delivery and persistent classroom throttling are integrated and tested.
  app.get('/api/auth/get-session', async c => {
    if (accounts) {
      const actor = await accounts.auth.api.getSession({ headers: c.req.raw.headers });
      if (actor?.user.principalKind === 'learner') return c.json({ user: { id: actor.user.id, name: actor.user.name, principalKind: 'learner' } });
    }
    return auth.handler(c.req.raw);
  });
  app.post('/api/auth/sign-out', c => auth.handler(c.req.raw));
  if (accounts) {
    app.post('/api/auth/two-factor/enable', async c => {
      const session = await accounts.auth.api.getSession({ headers: c.req.raw.headers });
      if (!session) return c.json({ error: 'Sign in to continue' }, 401);
      if (session.user.principalKind !== 'adult' || !session.user.emailVerified) return c.json({ error: 'Verified adult account required' }, 403);
      return auth.handler(c.req.raw);
    });
    for (const path of ['/sign-up/email', '/sign-in/email', '/request-password-reset', '/send-verification-email', '/reset-password', '/two-factor/verify-totp', '/two-factor/verify-backup-code']) {
      app.post(`/api/auth${path}`, c => auth.handler(c.req.raw));
    }
    app.get('/api/auth/verify-email', c => auth.handler(c.req.raw));
    app.get('/api/auth/reset-password/:token', c => auth.handler(c.req.raw));
    app.route('/api/account', createAccountRoutes(accounts.auth, accounts.db));
    if (config.BETTER_AUTH_SECRET) {
      const classroomConfig = { APP_ORIGIN: config.APP_ORIGIN, BETTER_AUTH_SECRET: config.BETTER_AUTH_SECRET };
      app.route('/api/manage', createClassroomRoutes(accounts.auth, accounts.db, classroomConfig));
      app.route('/api/schools', createSchoolRoutes(accounts.auth, accounts.db, classroomConfig));
      app.route('/api/family', createFamilyRoutes(accounts.auth, accounts.db, classroomConfig));
      app.route('/api/student', createStudentRoutes(accounts.auth, accounts.db, classroomConfig));
      app.route('/api/student/progress', createProgressRoutes(accounts.auth, accounts.db, classroomConfig));
    }
  }
  app.notFound(c => c.json({ error: 'Not found' }, 404));
  app.onError((error, c) => 'getResponse' in error && typeof error.getResponse === 'function' ? error.getResponse() : c.json({ error: 'Request failed' }, 500));
  return app;
}
