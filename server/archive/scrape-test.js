const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch(); // Launch headless browser
  const page = await browser.newPage();     // Open new page
  await page.goto('https://example.com');   // Go to website

  const title = await page.title();         // Get page title
  console.log(`Page title: ${title}`);      // Output to terminal

  await browser.close();                    // Close browser
})();