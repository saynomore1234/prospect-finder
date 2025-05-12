// index.js
const express = require('express');
const path = require('path');
const cors = require('cors'); // added cors

// ✅ Require the scraper and active job tracker
const scrapeProspects = require('./scrapers/scrapeProspects');
const { closeBrowser } = require('./utils/activeJob'); // ✅ correct

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // For future use if you ever need JSON POSTs

// Root route to confirm server is running
app.get('/', (req, res) => {
  res.send('✅ Prospect Finder API is running');
});

// Main scraping route: /search?q=your+query
app.get('/search', async (req, res) => {
  const query = req.query.q;
  const engine = 'bing'; // Hardcoded for now

  if (!query) {
    return res.status(400).json({ error: 'Missing search query (?q=your+search)' });
  }

  try {
    const result = await scrapeProspects(query); // 🔁 Use scraper logic
    res.json({
      query,
      engineUsed: engine,
      ...result
    });
  } catch (err) {
    console.error('❌ Scraping error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ NEW: Cancel scraping route
app.post('/cancel', async (req, res) => {
  try {
    await closeBrowser(); // 💥 Close the active Puppeteer instance
    res.status(200).json({ message: 'Scraping cancelled.' });
  } catch (err) {
    console.error('[cancel] Error:', err.message);
    res.status(500).json({ error: 'Failed to cancel scraping job.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});