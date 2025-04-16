// server/engines/duckEngine.js

// 🔁 Import the shared stealth logic to mask bot-like behavior
const applyStealth = require('../../utils/stealthApply');

async function scrapeDuckPages(browser, query) {
  const results = [];

  // 📄 Open a new browser tab
  const tab = await browser.newPage();
  await applyStealth(tab);
  console.log(`[duckEngine] Tab opened and stealth applied`);

  // 🌐 Build the DuckDuckGo search URL
  const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  console.log(`[duckEngine] Navigating to: ${url}`);

  try {
    // 🚀 Navigate to DuckDuckGo search page
    await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log('[duckEngine] Page loaded, waiting for results selector...');

    // ⏳ Wait for the results container to load
    await tab.waitForSelector('.results--main', { timeout: 5000 });

    console.log('[duckEngine] Selector found, scraping results...');
    // 🧪 Save screenshot of what DuckDuckGo is returning to verify
    //await tab.screenshot({ path: 'duck-fallback.png', fullPage: true });

    // 🧠 Scrape title, link, and snippet from search results
    const pageResults = await tab.evaluate(() => {
      const items = [];
      const blocks = document.querySelectorAll('.results .result');

      blocks.forEach(block => {
        const title = block.querySelector('h2')?.innerText || '';
        const link = block.querySelector('a')?.href || '';
        const snippet = block.querySelector('.result__snippet')?.innerText || '';

        if (title && link) {
          items.push({ title, link, snippet });
        }
      });

      return items;
    });

    console.log(`[duckEngine] Page returned ${pageResults.length} raw results`);

    results.push(...pageResults);
  } catch (err) {
    console.error('[duckEngine] ❌ Error during scraping:', err.message);
  } finally {
    await tab.close();
    console.log('[duckEngine] Tab closed');
  }

  console.log(`[duckEngine] ✅ Done. Total filtered results: ${results.length}`);
  return results;
}

module.exports = scrapeDuckPages;