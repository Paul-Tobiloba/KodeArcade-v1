import { defineConfig } from 'vitest/config';

export default defineConfig({
  // PGlite boots and migrates a fresh WASM database in beforeAll. Give setup
  // the same bounded budget as the integration tests on slower/loaded hosts.
  test: { environment: 'node', include: ['server/**/*.test.ts'], testTimeout: 30_000, hookTimeout: 30_000, fileParallelism: false },
});
