// server/utils/stealthApply.js

// List of real user-agents to randomly rotate
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
];

// Main function to apply stealth config to a Puppeteer tab
async function applyStealth(tab) {
  // 🎲 Pick a random user-agent
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  // 👀 Randomize viewport (simulate different screen sizes)
  const width = Math.floor(Math.random() * 300) + 1024; // 1024–1324px
  const height = Math.floor(Math.random() * 200) + 768; // 768–968px
  await tab.setViewport({ width, height });

  // 🧠 Apply fake user-agent string to look like a real browser
  await tab.setUserAgent(randomUserAgent);

  // 🗣️ Set common headers to mimic real browsing behavior
  await tab.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.google.com/',
  });

  // 🕵️‍♂️ Stealth fingerprint tweaks
  await tab.evaluateOnNewDocument(() => {
    // Block puppeteer from revealing it's a bot
    Object.defineProperty(navigator, 'webdriver', { get: () => false });

    // Fake common values
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4] });

    // Simulate presence of Chrome APIs
    window.chrome = {
      runtime: {},
      // Additional Chrome-like props can be added here
    };
  });
}

module.exports = applyStealth;