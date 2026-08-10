import { test, devices } from '@playwright/test';

// ==========================================
// CONFIGURATION VARIABLES
// ==========================================
const DEFAULTS = {
  urls: [
    'https://www.mcdonalds.com/au/en-au/competitions-terms-and-conditions.html',

  ],
  delayMs: 10000 // 10 seconds delay
};

// Force this entire test file to run in Desktop Firefox
test.use({ ...devices['Desktop Firefox'] });

test.describe('Dynamic Firefox Screenshots with Custom Naming', () => {
  
  for (const url of DEFAULTS.urls) {
    
    test(`Capture full page for ${url}`, async ({ page }) => {
      // 1. Extend timeout based on custom delay configurations
      const maximumTimeout = DEFAULTS.delayMs + 30000;
      test.setTimeout(maximumTimeout);

      // 2. Navigate to target URL
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });

      // 3. Apply custom delay to let assets fully load
      console.log(`Waiting for custom delay of ${DEFAULTS.delayMs / 1000}s...`);
      await page.waitForTimeout(DEFAULTS.delayMs);

      // 4. Fetch the real browser page title text dynamically
      const pageTitle = await page.title();

      // 5. Generate a clean timestamp string (Format: YYYYMMDD_HHMMSS)
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/T/, '_')
        .replace(/\..+/, '')
        .replace(/[^0-9_]/g, '');

      // 6. Combine and sanitize names to prevent file system errors
      const safePageName = pageTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const finalFileName = `screenshots/${safePageName}_${timestamp}.png`;

      // 7. Save full length snapshot file
      await page.screenshot({
        path: finalFileName,
        fullPage: true
      });

      console.log(`📸 Saved screenshot to: ${finalFileName}`);
    });
  }
});