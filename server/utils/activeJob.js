// activeJob.js
// Simple memory storage for the current active Puppeteer browser

let activeBrowser = null;

// Store the current browser
function setBrowser(browserInstance) {
  activeBrowser = browserInstance;
}

// Get the current browser
function getBrowser() {
  return activeBrowser;
}

// Clear and optionally close the current browser
async function closeBrowser() {
  if (activeBrowser) {
    try {
      await activeBrowser.close(); // Safely close Puppeteer
    } catch (err) {
      console.error('[cancel] Error closing browser:', err.message);
    }
    activeBrowser = null;
  }
}

module.exports = {
  setBrowser,
  getBrowser,
  closeBrowser
};
