import { test, devices } from '@playwright/test';
import { WebClient } from '@slack/web-api';

// ==========================================
// CONFIGURATION VARIABLES
// ==========================================
const DEFAULTS = {
  delayMs: 10000,
  slackChannelId: 'C0BP73V57NG', 
  testSuites: [
    { name: 'competitions', url: 'https://mcdonalds.com' },
    { name: 'MyMaccasRewards', url: 'https://mcdonalds.com' },
    { name: 'McDelivery', url: 'https://mcdonalds.com' }
  ]
};

// Initialize the Slack client securely without using the raw 'process' keyword
const env = (globalThis as any).process?.env || {};
const slackToken = env.SLACK_BOT_TOKEN || '';
const slackClient = slackToken ? new WebClient(slackToken) : null;

// Force this entire test file to run in Desktop Firefox
test.use({ ...devices['Desktop Firefox'] });

test.describe('Dynamic Firefox Screenshots to Slack', () => {
  
  for (const suite of DEFAULTS.testSuites) {
    test(`Capture full page for ${suite.name}`, async ({ page }) => {
      await page.goto(suite.url);
      
      // Generate clean timestamp dates (Format: DD-MM-YYYY)
      const date = new Date().toLocaleDateString('en-AU').replace(/\//g, '-');
      const finalFileName = `screenshots/${suite.name}_${date}.png`;
      const pageTitle = await page.title();

      // 1. Capture the snapshot image onto disk storage
      await page.screenshot({ path: finalFileName, fullPage: true });
      console.log(`📸 Saved screenshot locally: ${finalFileName}`);

      // 2. Upload the raw image file directly to your Slack channel window
      if (slackClient) {
        console.log(`Uploading ${finalFileName} straight to Slack...`);
        try {
          // Playwright saves the file instantly, so we can pass the path string directly 
          // to uploadV2 without importing or requiring external file system packages
          await slackClient.files.uploadV2({
            channel_id: DEFAULTS.slackChannelId,
            file: finalFileName, // Pass the path string directly
            filename: `${suite.name}_${date}.png`,
            initial_comment: `🚀 *New Playwright Capture Complete!*\n*URL tested:* ${suite.url}\n*Page Title:* ${pageTitle}`
          });
          console.log('✅ Screenshot uploaded directly to Slack channel!');
        } catch (slackError: any) {
          console.error('❌ Failed to upload image file to Slack API:', slackError.message);
        }
      } else {
        console.log('⚠️ Skipping Slack upload: SLACK_BOT_TOKEN environment variable is not defined.');
      }
    });
  } 
});