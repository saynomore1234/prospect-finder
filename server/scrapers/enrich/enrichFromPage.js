// enrichFromPage.js
// Loads a result's page and extracts additional content like heading and contact info

const { extractContacts } = require('./extractContacts'); // Import email/phone parser

// Enrich a single result by visiting the linked page and extracting content
async function enrichFromPage(browser, result) {
  console.log(`[enrichFromPage] Visiting: ${result.link}`);
  try {
    const page = await browser.newPage(); // Open a new tab
    await page.goto(result.link, { waitUntil: 'domcontentloaded', timeout: 10000 }); // Visit the result's page

    // Extract intro content and full body text for parsing
    const { intro, rawBody } = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText || '';
      const firstP = document.querySelector('p')?.innerText || '';
      return {
        intro: h1 || firstP || 'No useful content found',
        rawBody: document.body.innerText // Full text for email/phone detection
      };
    });

    await page.close(); // Close the tab

    const { emails, phones } = extractContacts(rawBody); // Parse emails and phones from text
    console.log(`[enrichFromPage] Extracted ${emails.length} emails and ${phones.length} phones`);

    return {
      ...result,
      extractedContent: result.snippet || intro,
      emails,
      phones
    };
  } catch (error) {
    console.error(`[enrichFromPage] Error processing ${result.link}: ${error.message}`);
    // If anything goes wrong, return basic fallback
    return {
      ...result,
      extractedContent: result.snippet || 'Error loading fallback content',
      emails: [],
      phones: []
    };
  }
}

module.exports = { enrichFromPage };
