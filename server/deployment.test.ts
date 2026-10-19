import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { matchesGlob } from 'node:path';
import { expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const deployment = JSON.parse(read('vercel.json'));
it('keeps the static Vite app and routes only API traffic to one Node entry', () => {
  expect(deployment.framework).toBe('vite');
  expect(deployment.outputDirectory).toBe('dist');
  expect(deployment.buildCommand).toBe('npm run build:vercel');
  // Hosted NODE_ENV=production must not omit TypeScript/Vite build tools.
  expect(deployment.installCommand).toBe('npm ci --include=dev');
  expect(deployment.rewrites).toEqual([{ source: '/api/:path*', destination: '/api' }]);
  expect(Object.keys(deployment.functions)).toEqual(['api/index.ts']);
  expect(deployment.functions['api/index.ts'].maxDuration).toBe(60);
  expect(deployment.fluid).toBe(true);
  expect(JSON.parse(read('package.json')).engines.node).toBe('24.x');
  expect(JSON.parse(read('tsconfig.server.json')).include).toContain('api');
});
it('includes the email/PDF logo and PDFKit built-in fonts in the function', () => {
  const pattern = deployment.functions['api/index.ts'].includeFiles;
  const assets = ['public/brand/mark-email.png', ...readdirSync(new URL('../node_modules/pdfkit/js/data/', import.meta.url)).map(name => `node_modules/pdfkit/js/data/${name}`)];
  expect(assets.length).toBeGreaterThan(10);
  for (const asset of assets) {
    expect(existsSync(new URL(`../${asset}`, import.meta.url))).toBe(true);
    expect(matchesGlob(asset, pattern)).toBe(true);
  }
});
it('keeps local secrets and review output out of CLI uploads without excluding runtime assets', () => {
  const patterns = read('.vercelignore').trim().split(/\r?\n/);
  for (const path of ['.env', '.env.local', '.env.production', '.vercel', '.impeccable', 'test-results', 'playwright-report']) {
    expect(patterns.some(pattern => matchesGlob(path, pattern))).toBe(true);
  }
  for (const path of ['api/index.ts', 'server/runtime.ts', 'shared/progress.ts', 'public/brand/mark-email.png']) {
    expect(patterns.some(pattern => matchesGlob(path, pattern))).toBe(false);
  }
  expect(read('.gitignore')).toContain('.vercel/');
  expect(read('api/index.ts')).not.toMatch(/process\.loadEnvFile|from ['"].*server\/index/);
  expect(JSON.stringify(deployment)).not.toMatch(/DATABASE_URL|BETTER_AUTH_SECRET|RESEND_API_KEY|db:migrate/);
});
