import { defineConfig, devices } from '@playwright/test';

// Safely access the system environment map without needing @types/node
const env = (globalThis as any).process?.env || {};
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!env.CI,
  retries: env.CI ? 2 : 0,
  workers: env.CI ? 1 : undefined,

  // Correctly formatted multi-reporter array block
  reporter: [
    ['html'],
    [
      'playwright-slack-report',
      {
        slackWebHookUrl: env.SLACK_WEBHOOK,
        sendResults: 'always', 
        showAreaChart: true,   
      },
    ],
  ],

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});