// scrapeProspects.js – Main orchestrator: search → filter → enrich → return results

const launchBrowser = require('../utils/browserLauncher');
const smartScraper = require('../utils/smartScraper'); // Our Bing-only smart wrapper
const { enrichInBatches } = require('./enrich/enrichInBatches');
const filterByQuery = require('./enrich/filterByQuery');

// 🧠 Import new enrichers
const { 
  extractContacts,
  extractNameFromTitle,
  extractCompanyFromTitleOrLink,
  extractJobTitleFromSnippet
} = require('./enrich/extractDetails');

/**
 * Main function that:
 * 1. Scrapes using Bing
 * 2. Filters results based on keyword, industry, region
 * 3. Enriches results with contact info and company info
 * 4. Returns full structured output
 * 
 * @param {string} query - The user’s search term (e.g. "seo consultant new york")
 * @param {object} options - Optional filters (industry, region)
 * @returns {object} - Final enriched results for frontend
 */
async function scrapeProspects(query, options = {}) {
  console.log(`[scrapeProspects] Starting scrape for query: "${query}"`);

  const browser = await launchBrowser({
    headless: 'new',
    autoStealthTab: false
  });

  try {
    const { engineUsed, results: rawResults } = await smartScraper(browser, query);

    console.log(`[scrapeProspects] Scraped ${rawResults.length} raw results using: ${engineUsed}`);

    // 🔍 Filter results by keyword, region, and/or industry
    const filteredResults = filterByQuery(rawResults, {
      keyword: query,
      industry: options.industry,
      region: options.region
    });

    console.log(`[scrapeProspects] ${filteredResults.length} results passed filtering`);

    // 🧠 Enrich each filtered result with new fields
    const mappedResults = filteredResults.map(item => {
      const contacts = extractContacts(item.snippet || '');

      return {
        title: item.title || '',
        link: item.link || '',
        snippet: item.snippet || '',
        emails: contacts.emails || [],
        phones: contacts.phones || [],
        name: extractNameFromTitle(item.title || ''),
        company: extractCompanyFromTitleOrLink(item.title || '', item.link || ''),
        jobTitle: extractJobTitleFromSnippet(item.snippet || '')
      };
    });

    console.log(`[scrapeProspects] 🧠 After enrichment pass: ${mappedResults.length} records`);

    // 📦 Further enrich in batches (e.g., LinkedIn scraping, extra data) if needed
    const enrichedResults = await enrichInBatches(browser, mappedResults, 5);

    console.log(`[scrapeProspects] Final enrichment complete. Total records: ${enrichedResults.length}`);

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
    await browser.close(); // 🔒 Always close browser
  }
}

module.exports = scrapeProspects;