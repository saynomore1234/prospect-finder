// braveEngine.js – Scrape Brave Search results using Puppeteer with stealth

const applyStealth = require('../../utils/stealthApply');
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Scrapes Brave Search pages and filters the results.
 * @param {object} browser - Puppeteer browser instance
 * @param {string} query - The search term
 * @param {function} filterFn - Optional filter function
 * @returns {Array} filtered results
 */
async function scrapeBravePages(browser, query, filterFn) {
  const results = [];
  const maxPages = 20;
  let page = 0;
  let keepGoing = true;

  while (keepGoing && page < maxPages) {
    const tab = await browser.newPage();
    await applyStealth(tab);

    const offset = page * 10;
    const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}&offset=${offset}`;
    console.log(`[braveEngine] Navigating to page ${page + 1}: ${url}`);

    try {
      await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await tab.waitForSelector('ul#results', { timeout: 10000 });

      const pageResults = await tab.evaluate(() => {
        const blocks = document.querySelectorAll('ul#results > li');
        const items = [];

        blocks.forEach(block => {
          const title = block.querySelector('h2')?.innerText || '';
          const link = block.querySelector('a')?.href || '';
          const snippet = block.querySelector('p')?.innerText || '';

          if (title && link) {
            items.push({ title, link, snippet });
          }
        });

        return items;
      });

      console.log(`[braveEngine] Page ${page + 1} returned ${pageResults.length} raw results`);

      if (pageResults.length === 0) {
        keepGoing = false;
      } else {
        const filtered = filterFn ? pageResults.filter(filterFn) : pageResults;
        console.log(`[braveEngine] Page ${page + 1}: ${filtered.length} passed filters`);
        results.push(...filtered);
      }
    } catch (err) {
      console.error(`[braveEngine] ⚠️ Error on page ${page + 1}: ${err.message}`);
    } finally {
      await tab.close();
    }

    page++;
    await delay(1000);
  }

  console.log(`[braveEngine] ✅ Done. Total filtered results: ${results.length}`);
  return results;
}

scrapeBravePages.searchUrl = 'https://search.brave.com/search';
module.exports = scrapeBravePages;