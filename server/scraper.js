const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function scrapeLinkedInSearch(query) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  try {
    console.log(`Navigating to: ${url}`);
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // Screenshot path (always inside /server folder)
    const screenshotPath = path.join(__dirname, 'screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const results = await page.evaluate(() => {
      const data = [];
      const entries = document.querySelectorAll('div.g');

      entries.forEach(entry => {
        const titleEl = entry.querySelector('h3');
        const linkEl = entry.querySelector('a');

        if (titleEl && linkEl) {
          data.push({
            title: titleEl.innerText,
            link: linkEl.href
          });
        }
      });

      return data;
    });

    await browser.close();

    return {
      keyword: query,
      totalFound: results.length,
      results
    };
  } catch (err) {
    console.error('❌ Scraping failed:', err.message);
    await browser.close();
    throw err; // Let Express handle this in the API layer
  }
}

module.exports = scrapeLinkedInSearch;