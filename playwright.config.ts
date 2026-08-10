import { defineConfig, devices } from '@playwright/test';

// Safely pull system environment variables without causing typescript errors
const env = (globalThis as any).process?.env || {};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!env.CI,
  retries: env.CI ? 2 : 0,
  workers: env.CI ? 1 : undefined,

  // Clean, flat configuration format for multi-reporters
  reporter: [
    ['html'],
    [
      'playwright-slack-report',
      {
        slackWebHookUrl: env.SLACK_WEBHOOK || '',
        sendResults: 'always'
      }
    ]
  ],

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
