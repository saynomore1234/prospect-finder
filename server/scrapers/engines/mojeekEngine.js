// mojeekEngine.js – Scrape Mojeek search results with filtering & safety

// Import stealth logic to disguise browser automation
const applyStealth = require('../../utils/stealthApply');

// Simple delay utility for pacing between requests
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Scrapes Mojeek search results (supports pagination)
 * Applies optional filter function to clean results inline
 * @param {object} browser - Puppeteer browser instance
 * @param {string} query - Search keyword
 * @param {function} filterFn - Optional custom filter function (title/snippet-based)
 * @returns {Array} filteredResults - Final list of cleaned search results
 */
async function scrapeMojeek(browser, query, filterFn) {
  const results = []; // Accumulator for final output
  const maxPages = 10; // 🔒 Safety cap to limit scraping depth

  let page = 0;
  let keepGoing = true;

  while (keepGoing && page < maxPages) {
    const tab = await browser.newPage(); // Create a new browser tab
    await applyStealth(tab); // Apply stealth techniques to prevent detection

    const offset = page * 10; // Mojeek uses offset pagination in 10s
    const url = `https://www.mojeek.com/search?q=${encodeURIComponent(query)}&s=${offset}`;
    console.log(`[mojeekEngine] Navigating to page ${page + 1}: ${url}`);

    try {
      // Navigate to the current Mojeek result page
      await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

      // Wait for the results container to appear
      await tab.waitForSelector('.results', { timeout: 5000 });

      // Extract visible title, link, and snippet from result blocks
      const pageResults = await tab.evaluate(() => {
        const blocks = document.querySelectorAll('.result');
        const items = [];

        blocks.forEach(block => {
          const title = block.querySelector('h2')?.innerText || '';
          const link = block.querySelector('h2 a')?.href || '';
          const snippet = block.querySelector('p')?.innerText || '';

          if (title && link) {
            items.push({ title, link, snippet });
          }
        });

        return items; // Return structured raw result set
      });

      console.log(`[mojeekEngine] Page ${page + 1} returned ${pageResults.length} raw results`);

      if (pageResults.length === 0) {
        keepGoing = false; // Stop if no new results were found
      } else {
        // Optionally filter the page results (if a filterFn was passed)
        const filtered = filterFn ? pageResults.filter(filterFn) : pageResults;
        console.log(`[mojeekEngine] Page ${page + 1}: ${filtered.length} passed filters`);

        // Append the valid items to our results array
        results.push(...filtered);
      }
    } catch (err) {
      console.error(`[mojeekEngine] ⚠️ Error on page ${page + 1}: ${err.message}`);
    } finally {
      await tab.close(); // Always close the tab to free resources
    }

    page++;
    await delay(1000); // ⏱ Delay to mimic human browsing & avoid blocks
  }

  console.log(`[mojeekEngine] ✅ Done. Total filtered results: ${results.length}`);
  return results;
}

// Export this function for external use (e.g., smartScraper or engine router)
scrapeMojeek.searchUrl = 'https://www.mojeek.com/search';
module.exports = scrapeMojeek;
