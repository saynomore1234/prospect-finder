// ecosiaEngine.js – Scrape Ecosia results using Puppeteer with stealth

const applyStealth = require('../../utils/stealthApply');
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Scrapes Ecosia search results using Puppeteer
 * Applies optional filter function for result relevance
 * @param {object} browser - Puppeteer browser instance
 * @param {string} query - Search keyword
 * @param {function} filterFn - Optional filter function (title/snippet-based)
 * @returns {Array} filteredResults - Cleaned and filtered results
 */
async function scrapeEcosia(browser, query, filterFn) {
  const results = [];
  const maxPages = 20; // 🔒 Safety limit
  let page = 0;
  let keepGoing = true;

  while (keepGoing && page < maxPages) {
    const tab = await browser.newPage();
    await applyStealth(tab);

    const offset = page * 10;
    const url = `https://www.ecosia.org/search?q=${encodeURIComponent(query)}&p=${offset}`;
    console.log(`[ecosiaEngine] Navigating to page ${page + 1}: ${url}`);

    try {
      await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await tab.waitForSelector('.mainline-results', { timeout: 15000 });

      const pageResults = await tab.evaluate(() => {
        const blocks = document.querySelectorAll('.mainline-results article');
        const items = [];

        blocks.forEach(block => {
          const title = block.querySelector('h2')?.innerText || '';
          const link = block.querySelector('a.result-title')?.href || '';
          const snippet = block.querySelector('p')?.innerText || '';

          if (title && link) {
            items.push({ title, link, snippet });
          }
        });

        return items;
      });

      console.log(`[ecosiaEngine] Page ${page + 1} returned ${pageResults.length} raw results`);

      if (pageResults.length === 0) {
        keepGoing = false;
      } else {
        const filtered = filterFn ? pageResults.filter(filterFn) : pageResults;
        console.log(`[ecosiaEngine] Page ${page + 1}: ${filtered.length} passed filters`);
        results.push(...filtered);
      }
    } catch (err) {
      console.error(`[ecosiaEngine] ⚠️ Error on page ${page + 1}: ${err.message}`);
    } finally {
      await tab.close();
    }

    page++;
    await delay(1000);
  }

  console.log(`[ecosiaEngine] ✅ Done. Total filtered results: ${results.length}`);
  return results;
}

scrapeEcosia.searchUrl = 'https://www.ecosia.org/search';
module.exports = scrapeEcosia;
