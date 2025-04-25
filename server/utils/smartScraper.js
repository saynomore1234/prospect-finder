// smartScraper.js – Bing-only scraping logic with fallback screenshot support

// Import Node.js built-in modules for saving a screenshot if scraping fails
const fs = require('fs');
const path = require('path');

// Import your Bing engine directly (no more engine switching needed)
const bingEngine = require('../scrapers/engines/bingEngine');

/**
 * Main scraper logic — uses Bing only.
 * - Scrapes using Bing
 * - Filters results if a filterFn is provided
 * - Takes screenshot if Bing returns 0 results (for debug)
 *
 * @param {object} browser - Puppeteer browser instance passed from your backend
 * @param {string} query - Search keyword or phrase
 * @param {function|null} filterFn - Optional filter (e.g., only keep results with "SEO")
 * @returns {object} - { engineUsed: 'bing', results: [...] }
 */
async function smartScraper(browser, query, filterFn = null) {
  console.log(`[smartScraper] 🔍 Scraping via Bing for: "${query}"`);

  try {
    // Call Bing scraping engine with query and optional filter
    const results = await bingEngine(browser, query, filterFn);

    // ✅ If results exist, return them
    if (Array.isArray(results) && results.length > 0) {
      console.log(`[smartScraper] ✅ Bing returned ${results.length} result(s)`);
      return { engineUsed: 'bing', results };
    }

    // ⚠️ If no results were found, take screenshot for debugging
    console.warn('[smartScraper] ⚠️ No results found – taking fallback screenshot...');

    // Open new tab to capture what Bing is showing visually
    const tab = await browser.newPage();
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // Save screenshot in root folder (or logs/screenshots later)
    const screenshotPath = path.join(process.cwd(), 'fallback-bing.png');
    await tab.screenshot({ path: screenshotPath, fullPage: true });

    await tab.close(); // Always close Puppeteer tabs
    return { engineUsed: 'bing', results: [] }; // Still return structure even with no results
  } catch (err) {
    // ❌ If the Bing engine throws an error (e.g., timeout, selector error), log it and return empty
    console.error(`[smartScraper] ❌ Bing scraping failed: ${err.message}`);
    return { engineUsed: null, results: [] };
  }
}

// Export the function so scrapeProspects.js or any route can call it
module.exports = smartScraper;