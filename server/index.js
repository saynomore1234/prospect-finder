const express = require('express');
const app = express();
const scrapeBing = require('./scrapers/scrapeBing'); // Keep only Bing scraper

// Root route
app.get('/', (req, res) => {
  res.send('Prospect Finder API is running 🚀');
});

// Main search route
app.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Missing search query (q) parameter" });
  }

  try {
    // Only call Bing scraper now
    const results = await scrapeBing(query);

    res.json({
      query,
      engineUsed: 'bing',
      engine: 'bing',
      totalFound: results.length,
      results,
    });
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    res.status(500).json({ error: 'Something went wrong during scraping.' });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});