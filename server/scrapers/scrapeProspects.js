// scrapeProspects.js
// Main orchestrator that handles the full prospect search + enrichment flow

const launchBrowser = require('../utils/browserLauncher'); // Handles Puppeteer browser launch
const smartScraper = require('../utils/smartScraper');     // NEW: Smart wrapper with fallback, screenshot, retry
const { enrichInBatches } = require('./enrich/enrichInBatches');
const filterByQuery = require('./enrich/filterByQuery');

/**
 * Main function to search, filter, enrich, and return full results
 * @param {string} query - User's search term (e.g., "seo expert philippines")
 * @param {object} options - Optional filters like industry/region
 * @returns {object} - Final enriched results object
 */
async function scrapeProspects(query, options = {}) {
  console.log(`[scrapeProspects] Starting scrape for query: "${query}"`);

  // 🚀 Launch browser using our stealth launcher
  const browser = await launchBrowser({
    headless: 'new',
    autoStealthTab: false // We'll apply stealth manually per tab
  });

  try {
    // 🧠 Use smartScraper to:
    // 1. Try multiple engines in order (bing, duck, brave, etc.)
    // 2. Take screenshot if results are empty
    // 3. Return the first successful engine + result set
    const { engineUsed, results: rawResults } = await smartScraper(browser, query, ['bing', 'duck']);

    console.log(`[scrapeProspects] Scraped ${rawResults.length} raw results from engine: ${engineUsed}`);

    // 🔍 Filter the scraped results to only include relevant ones
    const filteredResults = filterByQuery(rawResults, {
      keyword: query,
      industry: options.industry,
      region: options.region
    });

    console.log(`[scrapeProspects] ${filteredResults.length} results passed relevance filtering`);

    // 📦 Enrich results in batches (e.g., fetch extra details like emails, contact info)
    const enrichedResults = await enrichInBatches(browser, filteredResults, 5);

    console.log(`[scrapeProspects] Enrichment complete. Final results: ${enrichedResults.length}`);

    // ✅ Return a consistent structure that includes the engine used
    return {
      query,
      engineUsed,
      engine: engineUsed, // For compatibility with older frontend structure
      totalFound: enrichedResults.length,
      results: enrichedResults
    };
  } catch (err) {
    console.error('[scrapeProspects] ❌ Error during scraping:', err);
    throw err;
  } finally {
    // 🔒 Always close the browser to avoid memory leaks
    await browser.close();
  }
}

module.exports = scrapeProspects;