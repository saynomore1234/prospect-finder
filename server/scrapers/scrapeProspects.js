// scrapeProspects.js
// Main orchestrator that handles the full prospect search + enrichment flow

const launchBrowser = require('../utils/browserLauncher'); //new launcher browser, where pupetter should take place here. 
const getEngine = require('./engines'); //plug engine/index.js
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

  const browser = await launchBrowser({//launcher browser
    headless: 'new',
    autoStealthTab: false, // we’ll apply stealth manually in bingEngine
  });
  
  try {
    // Step 1: Scrape Bing search results (default 3 pages)
    const scrapeEngine = getEngine('bing'); // we’ll rotate/fallback this later
    let rawResults = await scrapeEngine(browser, query);

    //fallback if incase bing engine will not work. This is test code at the moment using as duckduckgo as teh backup.
    if (!rawResults || rawResults.length === 0) {
      console.warn('[scrapeProspects] ⚠️ No results from Bing. Falling back to DuckDuckGo...');
      const fallbackEngine = getEngine('duck');
      rawResults = await fallbackEngine(browser, query);
    }    

    console.log(`[scrapeProspects] Scraped ${rawResults.length} raw results from Bing`);

    // Step 2: Filter the results based on keyword/industry/region match
    const filteredResults = filterByQuery(rawResults, {
      keyword: query,
      industry: options.industry,
      region: options.region
    });
    console.log(`[scrapeProspects] ${filteredResults.length} results passed relevance filtering`);

    // Step 3: Enrich each filtered result in batches of 5
    const enrichedResults = await enrichInBatches(browser, filteredResults, 5);
    console.log(`[scrapeProspects] Enrichment complete. Final results: ${enrichedResults.length}`);

    // Return data in expected response format
    return {
      engine: 'bing',
      totalFound: enrichedResults.length,
      results: enrichedResults
    };
  } catch (err) {
    console.error('[scrapeProspects] ❌ Error during scraping:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

module.exports = scrapeProspects;
