import { existsSync } from 'node:fs';
import { serve } from '@hono/node-server';
import { createRuntime } from './runtime.js';

if (existsSync('.env')) process.loadEnvFile('.env');
const { config, app, pool } = createRuntime(process.env);
const server = serve({ fetch: app.fetch, port: config.PORT, hostname: '127.0.0.1' }, () => {
  console.info(`KodeArcade API listening on loopback port ${config.PORT}`);
});
let closing = false;
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => {
  if (closing) return;
  closing = true;
  server.close(() => { void pool.end().then(() => process.exit(0)); });
});
