// scrapeProspects.js – Main orchestrator: search → filter → enrich → return results

const launchBrowser = require('../utils/browserLauncher');
const smartScraper = require('../utils/smartScraper'); // Our Bing-only smart wrapper
const { enrichInBatches } = require('./enrich/enrichInBatches');
const filterByQuery = require('./enrich/filterByQuery');

/**
 * Main function that:
 * 1. Scrapes using Bing
 * 2. Filters results based on keyword, industry, region
 * 3. Enriches results with contact info
 * 4. Returns full structured output
 * 
 * @param {string} query - The user’s search term (e.g. "seo consultant new york")
 * @param {object} options - Optional filters (industry, region)
 * @returns {object} - Final enriched results for frontend
 */
async function scrapeProspects(query, options = {}) {
  console.log(`[scrapeProspects] Starting scrape for query: "${query}"`);

  // 🚀 Launch Puppeteer with stealth settings
  const browser = await launchBrowser({
    headless: 'new',
    autoStealthTab: false
  });

  try {
    // 🧠 Smart wrapper (Bing only) – returns { engineUsed, results }
    const { engineUsed, results: rawResults } = await smartScraper(browser, query);

    console.log(`[scrapeProspects] Scraped ${rawResults.length} raw results using: ${engineUsed}`);

    // 🔍 Filter results by keyword, region, and/or industry
    const filteredResults = filterByQuery(rawResults, {
      keyword: query,
      industry: options.industry,
      region: options.region
    });

    console.log(`[scrapeProspects] ${filteredResults.length} results passed filtering`);

    // 📦 Enrich results (e.g. extract emails, socials, etc.)
    const enrichedResults = await enrichInBatches(browser, filteredResults, 5);

    console.log(`[scrapeProspects] Enrichment complete. Final results: ${enrichedResults.length}`);

    // ✅ Return consistent structure
    return {
      query,
      engineUsed,
      engine: engineUsed,
      totalFound: enrichedResults.length,
      results: enrichedResults
    };
  } catch (err) {
    console.error('[scrapeProspects] ❌ Error during scraping:', err);
    throw err;
  } finally {
    await browser.close(); // 🔒 Ensure browser is closed after run
  }
}

module.exports = scrapeProspects;