// bingEngine.js
// Handles Bing search pagination and returns raw result blocks with safe logging and wait handling

const puppeteer = require('puppeteer');
const fs = require('fs'); // Used for debugging HTML output

// Search Bing and fetch multiple pages of results
async function searchBingPages(query, maxPages = 3) {
  console.log(`[bingEngine] Launching browser for query: "${query}"`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  for (let page = 0; page < maxPages; page++) {
    const pageIndex = 1 + page * 10; // Bing pagination offset
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&first=${pageIndex}`;
    console.log(`[bingEngine] Navigating to: ${url}`);

    const tab = await browser.newPage();
    await tab.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    );

    // Ensure we wait until the results block is there
    await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    try {
      await tab.waitForSelector('#b_results', { timeout: 5000 });
    } catch (e) {
      console.warn(`[bingEngine] ⚠️ b_results not found on page ${page + 1}`);
    }

    // Save HTML for debugging
    const html = await tab.content();
    fs.writeFileSync(`debug-bing-page-${page + 1}.html`, html);

    // Extract results
    const pageResults = await tab.evaluate(() => {
      const container = document.querySelector('#b_results');
      if (!container) return [];

      const blocks = container.querySelectorAll('li.b_algo');
      const items = [];

      blocks.forEach(block => {
        const title = block.querySelector('h2')?.innerText || '';
        const link = block.querySelector('h2 a')?.href || '';
        const snippet = block.querySelector('.b_caption p')?.innerText || '';
        if (title && link) {
          items.push({ title, link, snippet });
        }
      });

      return items;
    });

    console.log(`[bingEngine] Page ${page + 1}: Found ${pageResults.length} results`);
    results.push(...pageResults);
    await tab.close();
  }

  console.log(`[bingEngine] ✅ Total results collected: ${results.length}`);
  return { browser, results };
}

module.exports = { searchBingPages };