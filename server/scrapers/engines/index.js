// server/engines/index.js

const scrapeBing = require('./bingEngine');
const scrapeBrave = require('./braveEngine');    

/**
 * Returns the scraping function for the selected engine.
 * You can expand this easily.
 */
function getEngine(engine = 'bing') {
  switch (engine) {
    case 'bing':
      return scrapeBing;
    case 'brave':
      return scrapeBrave;
    default:
      console.warn(`[engineRouter] Unknown engine "${engine}", defaulting to Bing.`);
      return scrapeBing;
  }
}

module.exports = getEngine;
