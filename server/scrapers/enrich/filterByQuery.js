/**
 * Filters raw search results by keyword, industry, and region.
 * Loosened version for MVP — allows weak matches and removes domain blacklist.
 *
 * @param {Array} results - Raw Bing result objects [{ title, link, snippet }]
 * @param {Object} filters - { keyword, industry, region }
 * @returns {Array} - Filtered results
 */
function filterByQuery(results, { keyword, industry, region }) {
  const keywordLC = (keyword || '').toLowerCase();
  const keywordParts = keywordLC.split(' ').filter(Boolean); // split into words
  const industryLC = (industry || '').toLowerCase();
  const regionLC = (region || '').toLowerCase();

  return results.filter(result => {
    const title = result.title?.toLowerCase() || '';
    const snippet = result.snippet?.toLowerCase() || '';
    const link = result.link || '';

    // ✅ Loosened: Allow even 1 matched word to pass
    const matchedWords = keywordParts.filter(word =>
      title.includes(word) || snippet.includes(word)
    );
    const keywordMatch = matchedWords.length > 0;

    // ✅ Industry and region filters (optional, fuzzy match)
    const matchesIndustry = industryLC ? (title.includes(industryLC) || snippet.includes(industryLC)) : true;
    const matchesRegion = regionLC ? (title.includes(regionLC) || snippet.includes(regionLC)) : true;

    const passed = keywordMatch && matchesIndustry && matchesRegion;

    // 🪵 Log each result for debugging/filter review
    console.log(`[filterByQuery] ${passed ? '✅ PASSED' : '❌ REJECTED'} | Matched: ${matchedWords.length}/${keywordParts.length} | Title: "${result.title}"`);

    return passed;
  });
}

module.exports = filterByQuery;