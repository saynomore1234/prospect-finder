// scrapeProspects.js
// Main orchestrator that handles the full prospect search + enrichment flow

const { searchBingPages } = require('./engines/bingEngine'); // Bing search engine logic (pagination + results)
const { enrichFromPage } = require('./enrich/enrichFromPage'); // Enrichment logic: fetch additional data from each result page

// Main function to search, scrape, enrich, and return full results
async function scrapeProspects(query) {
  console.log(`[scrapeProspects] Starting scrape for query: "${query}"`);

  // Get results from Bing (default: 3 pages)
  const { browser, results } = await searchBingPages(query, 3);
  console.log(`[scrapeProspects] Retrieved ${results.length} results from Bing`);

  const finalResults = [];

  // Loop through each search result and enrich it
  for (const [index, result] of results.entries()) {
    console.log(`[scrapeProspects] Enriching result ${index + 1}/${results.length}: ${result.link}`);
    const enriched = await enrichFromPage(browser, result);
    finalResults.push(enriched);
  }

  await browser.close(); // Close the Puppeteer browser after all tabs done
  console.log(`[scrapeProspects] Completed scraping. Total enriched results: ${finalResults.length}`);

  // Return the final structured response
  return {
    engine: 'bing',
    totalFound: finalResults.length,
    results: finalResults
  };
}

module.exports = scrapeProspects; // Export so index.js can use it