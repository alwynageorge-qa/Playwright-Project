import { test, devices } from '@playwright/test';
import { WebClient } from '@slack/web-api';
import * as fs from 'fs';

// ==========================================
// CONFIGURATION VARIABLES
// ==========================================
const DEFAULTS = {
  urls: ['https://www.mcdonalds.com/au/en-au/competitions-terms-and-conditions.html'],
  delayMs: 10000,
  slackChannelId: 'C0BP73V57NG' // REPLACE WITH YOUR RAW SLACK CHANNEL ID
};

// Initialize the Slack client using your secure Bot Token
const slackToken = process.env.SLACK_BOT_TOKEN || '';
const slackClient = slackToken ? new WebClient(slackToken) : null;

// Force this entire test file to run in Desktop Firefox
test.use({ ...devices['Desktop Firefox'] });

test.describe('Dynamic Firefox Screenshots to Slack', () => {
  
  for (const url of DEFAULTS.urls) {
    
    test(`Capture and upload full page for ${url}`, async ({ page }) => {
      test.setTimeout(DEFAULTS.delayMs + 45000); // Pad timeout for upload latency

      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(DEFAULTS.delayMs);

      const pageTitle = await page.title();
      const safePageName = pageTitle.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Generate clean timestamp strings
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const finalFileName = `screenshots/${safePageName}_${timestamp}.png`;

      // 1. Capture the snapshot image onto disk storage
      await page.screenshot({ path: finalFileName, fullPage: true });
      console.log(`📸 Saved screenshot locally: ${finalFileName}`);

      // 2. Upload the raw image file directly to the Slack channel window
      if (slackClient && fs.existsSync(finalFileName)) {
        console.log(`Uploading ${finalFileName} straight to Slack...`);
        try {
          await slackClient.files.uploadV2({
            channel_id: DEFAULTS.slackChannelId,
            file: fs.createReadStream(finalFileName),
            filename: `${safePageName}_${timestamp}.png`,
            initial_comment: `🚀 *New Playwright Capture Complete!*\n*URL tested:* ${url}\n*Page Title:* ${pageTitle}`
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