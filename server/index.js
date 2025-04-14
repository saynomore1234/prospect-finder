// index.js
const express = require('express');
const path = require('path');

// ✅ Require the scraper properly (from scrapers folder)
const scrapeProspects = require('./scrapers/scrapeProspects');

const app = express();
const PORT = 3000;
const cors = require('cors'); //added cors
app.use(cors());

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});