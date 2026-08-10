import { test, devices } from '@playwright/test';
import { WebClient } from '@slack/web-api';

// ==========================================
// CONFIGURATION VARIABLES
// ==========================================
const DEFAULTS = {
  delayMs: 10000,
  slackChannelId: 'C0BP73V57NG', 
  testSuites: [
    { name: 'competitions', url: 'https://www.mcdonalds.com/au/en-au/competitions-terms-and-conditions.html' },
    { name: 'MyMaccasRewards', url: 'https://www.mcdonalds.com/au/en-au/mymaccas-rewards.html' },
    { name: 'McDelivery', url: 'https://www.mcdonalds.com/au/en-au/mcdelivery.html' }
  ]
};

// Custom date formatter function to return formats like "10Aug"
function getCustomDateStamp(): string {
  const date = new Date();
  const day = date.getDate(); // Extracts day as a number (e.g., 10)
  
  // Array map to convert month indexes cleanly into 3-letter strings
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = months[date.getMonth()]; 

  return `${day}${monthLabel}`;
}

// Initialize the Slack client securely without using the raw 'process' keyword
const env = (globalThis as any).process?.env || {};
const slackToken = env.SLACK_BOT_TOKEN || '';
const slackClient = slackToken ? new WebClient(slackToken) : null;

// Force this entire test file to run in Desktop Firefox
test.use({ ...devices['Desktop Firefox'] });

test.describe('Dynamic Firefox Screenshots to Slack', () => {
  
  // Track loop sequence index to append the unique run/test count
  for (let i = 0; i < DEFAULTS.testSuites.length; i++) {
    const suite = DEFAULTS.testSuites[i];
    
    test(`Capture full page for ${suite.name}`, async ({ page }) => {
      await page.goto(suite.url);
      await page.waitForTimeout(DEFAULTS.delayMs);

      // Generate parameters for your precise naming pattern: test name + date + sequence number
      const dateLabel = getCustomDateStamp();
      const runCount = i + 1; // Converts index 0,1,2 into sequential counts 1,2,3
      
      // Result layout matches exactly: screenshots/competitions-10Aug-1.png
      const filename = `screenshots/${suite.name}-${dateLabel}-${runCount}.png`;

      console.log(`Generated Filename: ${filename}`);

      // 1. Capture the full-length snapshot onto disk storage
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`📸 Saved screenshot locally: ${filename}`);

      // 2. Upload the raw image file directly to your Slack channel window
      if (slackClient) {
        console.log(`Uploading ${filename} straight to Slack...`);
        try {
          const now = new Date();
          const runtimeString = now.toLocaleTimeString('en-AU', { hour12: false });

          await slackClient.files.uploadV2({
            channel_id: DEFAULTS.slackChannelId,
            file: filename, 
            filename: `${suite.name}-${dateLabel}-${runCount}.png`,
            initial_comment: `🚀 *New Playwright Capture Complete!*\n*URL tested:* ${suite.url}\n*File Asset:* \`${suite.name}-${dateLabel}-${runCount}.png\`\n*Execution Time:* ${runtimeString}`
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