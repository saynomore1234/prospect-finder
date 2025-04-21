// bingEngine.js – Scrape all Bing pages automatically with filtering & safety

const fs = require('fs');
const delay = ms => new Promise(res => setTimeout(res, ms));
const applyStealth = require('../../utils/stealthApply'); // calling steathApply function

/**
 * Scrapes Bing pages until no more results found
 * Filters inline to avoid garbage enrichment
 * @param {object} browser - Puppeteer browser instance
 * @param {string} query - Search keyword
 * @param {function} filterFn - Custom filter function (title/snippet-based)
 * @returns {Array} filteredResults - Cleaned result list to enrich
 */
async function scrapeBingPages(browser, query, filterFn) {
  console.log('[bingEngine] ⛔ Simulated failure — returning no results');
  return [];
  const results = [];
  const maxPages = 20; // 🔒 safety cap (avoid infinite loop)

  let page = 0;
  let keepGoing = true;

  while (keepGoing && page < maxPages) {
    const tab = await browser.newPage();
    await applyStealth(tab);// inserted applyStealth
   
    await tab.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/113 Safari/537.36');

    const offset = page * 10 + 1;
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&first=${offset}`;
    console.log(`[bingEngine] Navigating to page ${page + 1}: ${url}`);

    try {
      await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
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
        keepGoing = false;
      } else {
        const filtered = filterFn ? pageResults.filter(filterFn) : pageResults;
        console.log(`[bingEngine] Page ${page + 1}: ${filtered.length} passed filters`);
        results.push(...filtered);
      }
    } catch (err) {
      console.error(`[bingEngine] ⚠️ Error on page ${page + 1}: ${err.message}`);
    } finally {
      await tab.close();
    }

    page++;
    await delay(1000); // 🛡 slight delay between page loads
  }

  console.log(`[bingEngine] ✅ Done. Total filtered results: ${results.length}`);
  return results;
}
scrapeBingPages.searchUrl = 'https://www.bing.com/search';
module.exports = scrapeBingPages;
