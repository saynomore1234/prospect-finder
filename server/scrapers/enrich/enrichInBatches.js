// helpers/enrichInBatches.js

const enrichFromPage = require('./enrichFromPage');

/**
 * Enriches results in batches using Puppeteer tabs
 * @param {Browser} browser - Puppeteer browser instance
 * @param {Array} results - Raw results to enrich (title, link, etc.)
 * @param {number} batchSize - Number of parallel tabs (default: 5)
 * @returns {Array} enrichedResults - All enriched result objects
 */
async function enrichInBatches(browser, results, batchSize = 5) {
  const enrichedResults = [];

  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);

    console.log(`[enrichInBatches] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(results.length / batchSize)}...`);

    // Create tabs for this batch
    const tabs = await Promise.all(batch.map(() => browser.newPage()));

    // Run enrichment in parallel (but isolated)
    const batchResults = await Promise.allSettled(
      batch.map((result, idx) => enrichFromPage(tabs[idx], result))
    );

    // Close all tabs regardless of success/fail
    await Promise.all(tabs.map(tab => tab.close()));

    // Collect successful enrichments (handle fails too)
    batchResults.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        enrichedResults.push(res.value);
      } else {
        console.error(`[enrichInBatches] ❌ Failed to enrich ${batch[idx].link}: ${res.reason}`);
        enrichedResults.push({
          ...batch[idx],
          extractedContent: 'Failed to enrich',
          emails: [],
          phones: []
        });
      }
    });
  }

  return enrichedResults;
}

module.exports = enrichInBatches;
