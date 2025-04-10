const express = require('express');
const app = express();
const scrapeLinkedInSearch = require('./scraper'); // your scraping logic

// Fallback queries
const queryTemplates = [
  'site:linkedin.com/in "SEO Expert" "Philippines"',
  'site:linkedin.com/in "IT Specialist" "Philippines"',
  'site:linkedin.com/in "Freelance Marketing" "Philippines"',
  'site:linkedin.com/in "Virtual Assistant" "Philippines"',
  'site:linkedin.com/in "Software Engineer" "Philippines"',
  'site:linkedin.com/in "UI/UX Designer" "Philippines"',
];

app.get('/', (req, res) => {
  res.send('Prospect Finder API is running 🚀');
});

app.get('/search', async (req, res) => {
  let searchQuery = req.query.q;

  // Use fallback if no query provided
  if (!searchQuery) {
    const randomIndex = Math.floor(Math.random() * queryTemplates.length);
    searchQuery = queryTemplates[randomIndex];
  }

  try {
    const result = await scrapeLinkedInSearch(searchQuery);
    res.json({ result });
  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({ error: 'Something went wrong during scraping.' });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});