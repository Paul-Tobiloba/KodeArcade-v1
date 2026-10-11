import { defineConfig } from 'drizzle-kit';

// Generation/checking is offline. Applying SQL uses the separate guarded migration runner.
export default defineConfig({ dialect: 'postgresql', schema: './server/db/schema.ts', out: './drizzle', strict: true, verbose: false });
