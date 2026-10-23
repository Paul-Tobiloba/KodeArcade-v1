import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  // Multi-step learning flows include animation, reloads and accessibility
  // audits. Bound the whole scenario without relaxing individual assertions.
  testDir: './e2e', fullyParallel: false, workers: 1, timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev -- --port 5173 --strictPort', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'], defaultBrowserType: 'chromium' } },
  ],
});
