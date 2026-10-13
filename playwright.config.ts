import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:43148',
    viewport: { width: 1400, height: 900 },
  },
  webServer: {
    command: 'npx astro preview --host 127.0.0.1 --port 43148',
    url: 'http://127.0.0.1:43148',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
