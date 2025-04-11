// index.js
const express = require('express'); // Load Express.js
const scrapeBing = require('./scrapers/scrapeProspects'); // Only use Bing scraper now

const app = express();
const PORT = 3000;

// Root route to check if the API is alive
app.get('/', (req, res) => {
  res.send('Prospect Finder API is running ✅');
});

// Main search endpoint: GET /search?q=some+keyword
app.get('/search', async (req, res) => {
  const query = req.query.q;         // Read search query
  const engine = 'bing';             // Force engine to Bing only

  if (!query) {
    return res.status(400).json({ error: 'Missing search query (?q=your+search)' });
  }

  try {
    const result = await scrapeBing(query); // Call the Bing scraper

    // Return the search results in a clean JSON format
    res.json({
      query,
      engineUsed: engine,
      ...result // Spread { engine, totalFound, results }
    });

  } catch (err) {
    console.error('❌ Scraping error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start the Express server on port 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});