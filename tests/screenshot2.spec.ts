import { test, devices } from '@playwright/test';
import { WebClient } from '@slack/web-api';

// ==========================================
// AUTOMATION CONFIGURATION BLOCK
// ==========================================
const CONFIG = {
  delayMs: 10000, // 10 seconds loading buffer
  slackChannelId: 'C0BP73V57NG',
  testSuites: [
    { name: 'AUWhatsNew', url: 'https://www.mcdonalds.com/au/en-au/whats-new.html?hsCacheBuster=990882' },
    { name: 'AUMyMaccas', url: 'https://www.mcdonalds.com/au/en-au/mymaccas-rewards.html?hsCacheBuster=819632' },
    { name: 'AUPartnerRewards', url: 'https://www.mcdonalds.com/au/en-au/partner-rewards.html' },
    { name: 'AUTimezone', url: 'https://mcdonalds.com/au/en-au/partner-rewards/timezone.html?hsCacheBuster=166923 ' },
    { name: 'AUZoneBowling', url: 'https://mcdonalds.com/au/en-au/partner-rewards/zone-bowling.html'}

  ]
};

// Generates explicit text month abbreviations (e.g., "10Aug")
function getFormattedDateStamp(): string {
  const date = new Date();
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const shortMonth = months[date.getMonth()];
  return `${day}${shortMonth}`;
}

const env = (globalThis as any).process?.env || {};
const slackClient = env.SLACK_BOT_TOKEN ? new WebClient(env.SLACK_BOT_TOKEN) : null;

test.use({ ...devices['Desktop Firefox'] });

test.describe('McDonalds Full Page Capture Routine', () => {
  
  for (let i = 0; i < CONFIG.testSuites.length; i++) {
    const suite = CONFIG.testSuites[i];
    
    test(`Snap and upload ${suite.name}`, async ({ page }) => {
      // Pad timeout boundaries safely for network load + slack streaming overheads
      test.setTimeout(CONFIG.delayMs + 45000);

      console.log(`Navigating to URL: ${suite.url}`);
      await page.goto(suite.url, {  waitUntil: 'networkidle' });
      
      console.log(`Holding execution for ${CONFIG.delayMs / 1000}s...`);
      await page.waitForTimeout(CONFIG.delayMs);

      // Build target naming convention variables cleanly
      const dateTag = getFormattedDateStamp();
      const executionCount = i + 1;
      const cleanFileName = `${suite.name}-${dateTag}-${executionCount}.png`;
      const localPath = `screenshots/${cleanFileName}`;

      // 1. Snapshot generation onto runner disk storage
      await page.screenshot({ path: localPath, fullPage: true });
      console.log(`📸 Image saved locally: ${localPath}`);

      // 2. Direct binary streaming payload delivery straight into Slack channels
      if (slackClient) {
        console.log(`Streaming asset ${cleanFileName} directly to Slack...`);
        try {
          const now = new Date();
          const timestampString = now.toLocaleTimeString('en-AU', { hour12: false });

          await slackClient.files.uploadV2({
            channel_id: CONFIG.slackChannelId,
            file: localPath,
            filename: cleanFileName,
            initial_comment: `🚀 *Playwright Capture Complete!*\n*Page Target:* \`${suite.name}\`\n*Direct link format tracking identifier:* \`${cleanFileName}\`\n*Timestamp:* ${timestampString} AEST`
          });
          console.log('✅ Asset posted successfully to channel workflow windows!');
        } catch (slackError: any) {
          console.error('❌ Slack binary stream rejected:', slackError.message);
        }
      } else {
        console.log('⚠️ Upload skipped: SLACK_BOT_TOKEN value is currently undefined.');
      }
    });
  }
});