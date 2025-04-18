// helpers/filterByQuery.js

/**
 * Filters raw search results by keyword, industry, region, and blacklist.
 * Also supports fuzzy partial matching on keyword chunks.
 *
 * @param {Array} results - Raw Bing result objects [{ title, link, snippet }]
 * @param {Object} filters - { keyword, industry, region }
 * @returns {Array} - Filtered results
 */
function filterByQuery(results, { keyword, industry, region }) {
  const keywordLC = (keyword || '').toLowerCase();
  const keywordParts = keywordLC.split(' ').filter(Boolean); // ← break into parts
  const industryLC = (industry || '').toLowerCase();
  const regionLC = (region || '').toLowerCase();

  const blacklist = [
    'youtube.com',
    'reddit.com',
    'pinterest.com',
    'twitter.com'
  ];

  return results.filter(result => {
    const title = result.title?.toLowerCase() || '';
    const snippet = result.snippet?.toLowerCase() || '';
    const link = result.link || '';

    // 🔒 Skip blacklisted domains
    if (blacklist.some(domain => link.includes(domain))) return false;

    // ✅ Keyword match: at least 50% of words found
    const matchedWords = keywordParts.filter(word =>
      title.includes(word) || snippet.includes(word)
    );
    const keywordMatch = matchedWords.length >= Math.ceil(keywordParts.length / 2);

    // ✅ Industry + Region filters
    const matchesIndustry = industryLC ? (title.includes(industryLC) || snippet.includes(industryLC)) : true;
    const matchesRegion = regionLC ? (title.includes(regionLC) || snippet.includes(regionLC)) : true;

    const passed = keywordMatch && matchesIndustry && matchesRegion;

    console.log(`[filterByQuery] ${passed ? '✅ PASSED' : '❌ REJECTED'} | Words Matched: ${matchedWords.length}/${keywordParts.length} | Title: "${result.title}"`);

    return passed;
  });
}

module.exports = filterByQuery;