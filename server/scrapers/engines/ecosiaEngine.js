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
  const maxPages = 20; // 🔒 Prevent infinite scraping loops
  let page = 0;
  let keepGoing = true;

  while (keepGoing && page < maxPages) {
    const tab = await browser.newPage();
    await applyStealth(tab); // Apply Puppeteer stealth mode

    const offset = page * 10;
    const url = `https://www.ecosia.org/search?q=${encodeURIComponent(query)}&p=${offset}`;
    console.log(`[ecosiaEngine] Navigating to page ${page + 1}: ${url}`);

    try {
      // Navigate to Ecosia result page
      await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

      // ✅ Smart cookie modal handler
      await delay(1000); // using the delay helper you already defined

      const cookiePromptExists = await tab.$('button.cookie-notice__accept');

      if (cookiePromptExists) {
        try {
          await tab.click('button.cookie-notice__accept');
          console.log('[ecosiaEngine] ✅ Cookie modal detected and dismissed');
          await delay(1000); // allow modal to fade out
        } catch (err) {
          console.warn('[ecosiaEngine] ⚠️ Tried to dismiss cookie modal but failed:', err.message);
        }
      } else {
        console.log('[ecosiaEngine] ℹ️ No cookie modal appeared');
      }

      // Wait for organic results to appear (not ads)
      await tab.waitForSelector('div[data-test-id="mainline-result-web"]', { timeout: 15000 });

      // Give page a moment for JS-rendered DOM to finalize
      await delay(1500);

      // Scrape results from DOM
      const pageResults = await tab.evaluate(() => {
        const blocks = document.querySelectorAll('div[data-test-id="mainline-result-web"]');
        const items = [];

        blocks.forEach(block => {
          const title = block.querySelector('.result-title')?.innerText || '';
          const link = block.querySelector('.result-title')?.href || '';
          const snippet = block.querySelector('p')?.innerText || '';

          // Only push results with both title and link (skip ads or broken entries)
          if (title && link) {
            items.push({ title, link, snippet });
          }
        });

        return { items, found: blocks.length }; // Return debug info too
      });

      console.log(`[ecosiaEngine] Page ${page + 1} found ${pageResults.found} result blocks`);
      console.log(`[ecosiaEngine] Page ${page + 1} returned ${pageResults.items.length} raw results`);

      if (pageResults.items.length === 0) {
        keepGoing = false; // Stop if no valid results
      } else {
        const filtered = filterFn ? pageResults.items.filter(filterFn) : pageResults.items;
        console.log(`[ecosiaEngine] Page ${page + 1}: ${filtered.length} passed filters`);
        results.push(...filtered);
      }
    } catch (err) {
      console.error(`[ecosiaEngine] ⚠️ Error on page ${page + 1}: ${err.message}`);
    } finally {
      await tab.close();
    }

    page++;
    await delay(2000); // slight delay before next page
  }

  console.log(`[ecosiaEngine] ✅ Done. Total filtered results: ${results.length}`);
  return results;
}

scrapeEcosia.searchUrl = 'https://www.ecosia.org/search';
module.exports = scrapeEcosia;