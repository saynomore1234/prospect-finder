// server/utils/stealthApply.js

/**
 * Applies stealth behavior to a Puppeteer page to reduce bot detection risk.
 * Includes: headers, navigator tricks, Chrome props spoofing, etc.
 */

async function applyStealth(tab) {
    // 👤 Fake user-agent and language headers
    await tab.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/113 Safari/537.36');
    await tab.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.google.com/',
    });
  
    // 🥷 Puppeteer fingerprint masking
    await tab.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
  
      window.chrome = {
        runtime: {},
        // Optional: add more fake Chrome props here
      };
    });
  }
  
  module.exports = applyStealth;  