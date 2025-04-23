// braveEngine.js – Scrape Brave search results with Puppeteer + Stealth

const applyStealth = require('./stealthApply');
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Scrapes Brave Search result pages
 * @param {object} browser - Puppeteer browser instance
 * @param {string} query - Search query
 * @param {function} filterFn - Optional filtering function
 * @returns {Array} - Clean filtered results
 */
async function scrapeBrave(browser, query, filterFn) {
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
      await delay(1500); // allow JS to load results

      // Detect if no results banner is shown
      const noResults = await tab.evaluate(() => {
        return document.body.innerText.includes("didn't find any results") || document.querySelector('#results') === null;
      });
      if (noResults) {
        console.log(`[braveEngine] ⚠️ No results found on page ${page + 1}. Ending.`);
        break;
      }

      // Scrape results under #results a[href] (bypasses dynamic class names)
      const pageResults = await tab.evaluate(() => {
        const anchors = document.querySelectorAll('#results a[href]');
        const items = [];

        anchors.forEach(a => {
          const title = a.innerText.trim();
          const link = a.href;
          const block = a.closest('div');
          const snippet = block?.querySelector('p')?.innerText.trim() || '';

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
      console.error(`[braveEngine] ❌ Error on page ${page + 1}: ${err.message}`);
    } finally {
      await tab.close();
    }

    page++;
    await delay(2000);
  }

  console.log(`[braveEngine] ✅ Done. Total filtered results: ${results.length}`);
  return results;
}

scrapeBrave.searchUrl = 'https://search.brave.com/search';
module.exports = scrapeBrave;