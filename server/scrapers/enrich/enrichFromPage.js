// Enrich a single result by visiting the linked page and extracting content
// enrichFromPage.js
const { extractContacts } = require('./extractDetails');

async function enrichFromPage(tab, result) {
  console.log(`[enrichFromPage] Visiting: ${result.link}`);

  try {
    const page = tab; // ✅ Use the tab passed from enrichInBatches

    await page.goto(result.link, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // Extract intro content and raw body text from the page
    const { intro, rawBody } = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText || '';
      const firstP = document.querySelector('p')?.innerText || '';
      const bodyText = document.body?.innerText || '';
      return {
        intro: `${h1} ${firstP}`.trim(),
        rawBody: bodyText.trim()
      };
    });

    console.log(`[enrichFromPage] Extracted intro + raw body from: ${result.link}`);
    console.log(`[extractDetails] Raw input text: ${rawBody?.slice(0, 100)}...`);

    const { emails, phones } = extractContacts(rawBody || '');

    console.log(`[extractDetails] ✅ Found ${emails.length} emails, ${phones.length} phones`);

    return {
      ...result,
      extractedContent: intro,
      emails,
      phones
    };
  } catch (err) {
    console.error(`[enrichFromPage] Error processing ${result.link}:`, err.message);
    return {
      ...result,
      extractedContent: '',
      emails: [],
      phones: []
    };
  } finally {
    try {
      await tab.close(); // Safely attempt to close tab
    } catch (err) {
      console.warn('[enrichFromPage] ⚠️ Failed to close tab:', err.message);
    }
  }  
}

module.exports = { enrichFromPage };
