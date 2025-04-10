// server/scrapers/scrapeBing.js
const puppeteer = require('puppeteer');

// Main function to scrape Bing with a given query
async function scrapeBing(query) {
  // Launch browser (headless by default for speed)
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Build Bing search URL with query
  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

  // Extract search results using DOM selectors
  const results = await page.evaluate(() => {
    const items = [];
    const nodes = document.querySelectorAll('.b_algo'); // Bing search result blocks

    nodes.forEach((node) => {
      const titleEl = node.querySelector('h2');
      const linkEl = node.querySelector('h2 a');
      const snippetEl = node.querySelector('.b_caption p');

      items.push({
        title: titleEl?.innerText || '',
        link: linkEl?.href || '',
        snippet: snippetEl?.innerText || '',
      });
    });

    return items;
  });

  await browser.close();

  // Return total + result array in a structured format
  return {
    engine: 'bing',
    totalFound: results.length,
    results,
  };
}

module.exports = scrapeBing;
