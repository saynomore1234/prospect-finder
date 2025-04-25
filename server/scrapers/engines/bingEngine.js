// server/scrapers/engines/bingEngine.js

const fs = require('fs');
const delay = ms => new Promise(res => setTimeout(res, ms));
const applyStealth = require('../../utils/stealthApply');

async function scrapeBingPages(browser, query, filterFn) {
  const results = [];
  const maxPages = 20;
  const maxRetries = 3; // 🔁 Max attempts if bot detected or zero results

  let page = 0;
  let keepGoing = true;

  while (keepGoing && page < maxPages) {
    let retries = 0;
    let success = false;

    while (retries < maxRetries && !success) {
      const tab = await browser.newPage();
      await applyStealth(tab);

      const offset = page * 10 + 1;
      const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&first=${offset}`;
      console.log(`[bingEngine] Navigating to page ${page + 1}: ${url} (Attempt ${retries + 1})`);

      try {
        await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

        // Quick check for bot detection keywords
        const pageText = await tab.evaluate(() => document.body.innerText);
        if (pageText.includes("detected unusual traffic") || pageText.includes("why did this happen")) {
          throw new Error('Bot detection triggered');
        }

        await tab.waitForSelector('#b_results', { timeout: 5000 });

        const pageResults = await tab.evaluate(() => {
          const blocks = document.querySelectorAll('li.b_algo');
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

        console.log(`[bingEngine] Page ${page + 1} returned ${pageResults.length} raw results`);

        if (pageResults.length === 0) {
          retries++;
          console.warn(`[bingEngine] ⚠️ No results found. Retrying... (${retries}/${maxRetries})`);
          await tab.close();
          await delay(1000 + Math.floor(Math.random() * 2000)); // 1-3s delay
        } else {
          const filtered = filterFn ? pageResults.filter(filterFn) : pageResults;
          console.log(`[bingEngine] Page ${page + 1}: ${filtered.length} passed filters`);
          results.push(...filtered);
          success = true;
          await tab.close();
        }
      } catch (err) {
        console.error(`[bingEngine] ⚠️ Retry ${retries + 1} failed: ${err.message}`);
        retries++;
        await tab.close();
        await delay(1500 + Math.floor(Math.random() * 2000)); // Randomized delay
      }
    }

    if (!success) {
      console.error(`[bingEngine] ❌ Failed to scrape page ${page + 1} after ${maxRetries} attempts. Stopping...`);
      keepGoing = false;
    }

    page++;
    await delay(1000); // Safety between pages
  }

  console.log(`[bingEngine] ✅ Done. Total filtered results: ${results.length}`);
  return results;
}

scrapeBingPages.searchUrl = 'https://www.bing.com/search';
module.exports = scrapeBingPages;