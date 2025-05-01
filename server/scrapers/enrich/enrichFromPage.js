const { extractContacts } = require('./extractDetails');

async function enrichFromPage(tab, result) {
  console.log(`[enrichFromPage] Visiting: ${result.link}`);

  try {
    await tab.goto(result.link, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    const data = await tab.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText || '';
      const firstP = document.querySelector('p')?.innerText || '';
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
      const body = document.body?.innerText || '';
      return {
        title,
        h1,
        firstP,
        metaDesc,
        rawText: body
      };
    });

    const { emails, phones } = extractContacts(data.rawText || '');

    return {
      ...result,
      pageTitle: data.title,
      pageHeading: data.h1,
      metaDescription: data.metaDesc,
      extractedContent: `${data.h1} ${data.firstP}`.trim(),
      emails: emails.length > 0 ? emails : result.emails,
      phones: phones.length > 0 ? phones : result.phones
    };
  } catch (err) {
    console.error(`[enrichFromPage] Error visiting ${result.link}:`, err.message);
    return {
      ...result,
      pageTitle: '',
      pageHeading: '',
      metaDescription: '',
      extractedContent: '',
      emails: result.emails,
      phones: result.phones
    };
  }
}

module.exports = { enrichFromPage };