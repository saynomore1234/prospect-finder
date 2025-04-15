// server/utils/browserLauncher.js
const puppeteer = require('puppeteer');

/**
 * Launches a Puppeteer browser with flexibility for stealth/fallback.
 * @param {object} options - Optional settings (headless, autoStealthTab)
 */
async function launchBrowser(options = {}) {
  const browser = await puppeteer.launch({
    headless: options.headless || 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  return browser;
}

module.exports = launchBrowser;