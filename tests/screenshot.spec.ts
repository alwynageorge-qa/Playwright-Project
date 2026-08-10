import { test } from '@playwright/test';

test('Capture screenshots from a URL', async ({ page }) => {
  // 1. Navigate to the target website
  await page.goto('https://mcdonalds.com/au/en-au/about-us/our-impact.html');

  // 2. Capture a standard viewport screenshot
  await page.screenshot({ 
    path: 'screenshots/viewport-capture-ourimpact.png' 
  });

  // 3. Capture the full scrollable webpage
  await page.screenshot({ 
    path: 'screenshots/full-page-capture-ourimpact.png', 
    fullPage: true 
  });
 // 1. Navigate to the target website
  await page.goto('https://mcdonalds.com/au/en-au/about-us/our-impact/food-sourcing.html');

  // 2. Capture a standard viewport screenshot
  await page.screenshot({ 
    path: 'screenshots/viewport-capture-fs.png' 
  });

  // 3. Capture the full scrollable webpage
  await page.screenshot({ 
    path: 'screenshots/full-page-capture-fs.png', 
    fullPage: true 
  });
  // 1. Navigate to the target website
  await page.goto('https://mcdonalds.com/au/en-au/arches-agri.html');

  // 2. Capture a standard viewport screenshot
  await page.screenshot({ 
    path: 'screenshots/viewport-capture-arches.png' 
  });

  // 3. Capture the full scrollable webpage
  await page.screenshot({ 
    path: 'screenshots/full-page-capture-arches.png', 
    fullPage: true 
  });
});