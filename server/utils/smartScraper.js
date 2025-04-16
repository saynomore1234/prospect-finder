// server/utils/smartScraper.js

// Built-in modules for saving screenshot file
const fs = require('fs');
const path = require('path');

// Our engine picker – lets us load 'bingEngine', 'duckEngine', etc.
const getEngine = require('../scrapers/engines');

/**
 * Smart scraping wrapper that:
 * - Tries each engine in order
 * - Checks if the results are valid
 * - If 0 results, takes a screenshot for debug
 * - Returns { engineUsed, results }
 * 
 * @param {object} browser - Puppeteer browser instance
 * @param {string} query - The search term to use
 * @param {Array<string>} engineList - List of engine names in order of priority
 */
async function smartScraper(browser, query, engineList = ['bing', 'duck']) {
  // 🔁 Loop through all the engines you want to try
  for (const engineName of engineList) {
    console.log(`[smartScraper] 🔍 Trying engine: ${engineName}`);

    try {
      // Load the actual scraping function for that engine (e.g. duckEngine.js)
      const scraper = getEngine(engineName);

      // Run the scraper and get back the search results
      const results = await scraper(browser, query);

      // ✅ If the scraper returned non-empty results, return it immediately
      if (Array.isArray(results) && results.length > 0) {
        console.log(`[smartScraper] ✅ Engine "${engineName}" succeeded with ${results.length} results`);
        return { engineUsed: engineName, results };
      }

      // ⚠️ If the engine returned 0 results, log warning and take screenshot
      console.warn(`[smartScraper] ⚠️ Engine "${engineName}" returned 0 results. Taking screenshot...`);

      // Open a tab to visually debug what the engine is seeing
      const fallbackTab = await browser.newPage();
      const fallbackUrl = `https://www.${engineName}.com/search?q=${encodeURIComponent(query)}`;
      await fallbackTab.goto(fallbackUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

      // Save the screenshot for review
      const screenshotPath = path.join(process.cwd(), `fallback-${engineName}.png`);
      await fallbackTab.screenshot({ path: screenshotPath, fullPage: true });
      await fallbackTab.close();

      console.log(`[smartScraper] 🧪 Screenshot saved for ${engineName} at ${screenshotPath}`);
    } catch (err) {
      // ❌ If something breaks during scraping (timeout, selector missing, etc.)
      console.error(`[smartScraper] ❌ Error using engine "${engineName}":`, err.message);
    }
  }

  // ❌ If we looped through all engines and all failed
  console.error('[smartScraper] ❌ All engines failed or returned 0 results.');
  return { engineUsed: null, results: [] };
}

// Export this so scrapeProspects can use it
module.exports = smartScraper;