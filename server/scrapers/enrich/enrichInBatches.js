// enrichInBatches.js
const { enrichFromPage } = require('./enrichFromPage');
const applyStealth = require('../../utils/stealthApply');

async function enrichInBatches(browser, results, batchSize = 5) {
  const enrichedResults = [];

  // Split results into batches of `batchSize`
  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    console.log(`\n[enrichInBatches] Processing batch ${i / batchSize + 1}/${Math.ceil(results.length / batchSize)}`);

    // Run enrichments in parallel within the batch
    const enrichedBatch = await Promise.all(
      batch.map(async (result, index) => {
        let tab;
        try {
          tab = await browser.newPage(); // Create new tab for each result
          await applyStealth(tab);       // 🛡️ Apply stealth
          console.log(`[enrichInBatches] Tab opened for result ${i + index + 1}`);
          const enriched = await enrichFromPage(tab, result);
          return enriched;
        } catch (err) {
          console.error(`[enrichInBatches] ❌ Error processing ${result.link}: ${err.message}`);
          return { ...result, extractedContent: '', emails: [], phones: [] }; // Return fallback
        } finally {
          if (tab && typeof tab.close === 'function') {
            try {
              await tab.close();
              console.log(`[enrichInBatches] Tab closed for result ${i + index + 1}`);
            } catch (closeErr) {
              console.warn(`[enrichInBatches] ⚠️ Failed to close tab: ${closeErr.message}`);
            }
          }
        }
      })
    );

    enrichedResults.push(...enrichedBatch);
  }

  return enrichedResults;
}

module.exports = { enrichInBatches };
