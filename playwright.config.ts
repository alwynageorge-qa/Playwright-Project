import { defineConfig, devices } from '@playwright/test';

// Safe global accessor to pull environmental secrets without compilation errors
const env = (globalThis as any).process?.env || {};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!env.CI,
  retries: env.CI ? 2 : 0,
  workers: env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    }
  ],
});