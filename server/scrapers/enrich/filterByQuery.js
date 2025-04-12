// helpers/filterByQuery.js

/**
 * Filters raw Bing search results by keyword relevance
 * Matches keyword, industry, or region in title/snippet
 *
 * @param {Array} results - Raw Bing result objects [{ title, link, snippet }]
 * @param {Object} filters - { keyword, industry, region }
 * @returns {Array} - Filtered results
 */
function filterByQuery(results, { keyword, industry, region }) {
    const keywordLC = (keyword || '').toLowerCase();
    const industryLC = (industry || '').toLowerCase();
    const regionLC = (region || '').toLowerCase();
  
    const blacklist = [
        'youtube.com',       // video platform
        'reddit.com',        // forum, not relevant
        'pinterest.com',     // image board
        // 'facebook.com',    ← TEMPORARILY ALLOW
        // 'linkedin.com',    ← ALLOW for now
        'twitter.com'        // often noisy
      ];
  
    return results.filter(result => {
      const title = result.title?.toLowerCase() || '';
      const snippet = result.snippet?.toLowerCase() || '';
      const link = result.link || '';
  
      // Skip blacklisted domains
      if (blacklist.some(domain => link.includes(domain))) return false;
  
      // Must match at least one intent-relevant keyword
      const matchesKeyword = title.includes(keywordLC) || snippet.includes(keywordLC);
      const matchesIndustry = industryLC ? (title.includes(industryLC) || snippet.includes(industryLC)) : true;
      const matchesRegion = regionLC ? (title.includes(regionLC) || snippet.includes(regionLC)) : true;
  
      return matchesKeyword && matchesIndustry && matchesRegion;
    });
  }
  
  module.exports = filterByQuery;
  