// server/engines/index.js

const scrapeBing = require('./bingEngine');
const scrapeMojeek = require('./mojeekEngine');
const scrapeBrave = require('./braveEngine');    
//const scrapeEcosia = require('./ecosiaEngine');  

/**
 * Returns the scraping function for the selected engine.
 * You can expand this easily.
 */
function getEngine(engine = 'bing') {
  switch (engine) {
    case 'bing':
      return scrapeBing;
      case 'mojeek':
  return scrapeMojeek;
    case 'brave':
      return scrapeBrave;
    //case 'ecosia':
      //return scrapeEcosia;
    default:
      console.warn(`[engineRouter] Unknown engine "${engine}", defaulting to Bing.`);
      return scrapeBing;
  }
}

module.exports = getEngine;
