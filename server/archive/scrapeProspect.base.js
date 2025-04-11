// scrapers/scrapeBing.js
const puppeteer = require('puppeteer');

// Scrape Bing search results
async function scrapeBing(query) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const results = await page.evaluate(() => {
      const data = [];
      const blocks = document.querySelectorAll('li.b_algo');

      blocks.forEach(block => {
        const titleEl = block.querySelector('h2');
        const linkEl = block.querySelector('h2 a');
        const descEl = block.querySelector('.b_caption p');

        if (titleEl && linkEl) {
          data.push({
            title: titleEl.innerText,
            link: linkEl.href,
            snippet: descEl ? descEl.innerText : ''
          });
        }
      });

      return data;
    });

    await browser.close();

    return {
      engine: 'bing',
      totalFound: results.length,
      results
    };
  } catch (error) {
    await browser.close();
    throw new Error(`Bing scraping failed: ${error.message}`);
  }
}

module.exports = scrapeBing;