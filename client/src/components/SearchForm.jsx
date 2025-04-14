// SearchForm.jsx
// This component handles the search input, triggers the backend scraper, and returns results to the parent.

import React, { useState } from 'react';

function SearchForm({ onResults }) {
  // Local state for search input
  const [query, setQuery] = useState('');

  // UI state for loading spinner
  const [loading, setLoading] = useState(false);

  // For showing error messages if request fails
  const [error, setError] = useState('');

  // Called when the form is submitted
  const handleSearch = async (e) => {
    e.preventDefault(); // prevents the page from refreshing

    if (!query.trim()) return; // do nothing if input is empty

    setLoading(true);   // show "loading..." on button
    setError('');       // clear any previous errors

    try {
      // Send GET request to backend scraper route
      const res = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      // If request is OK, send results back to parent (App.jsx)
      if (res.ok) {
        onResults(data); // lift results to App
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      // Handle network/server errors
      setError('Network error or server not reachable.');
    } finally {
      setLoading(false); // remove loading state
    }
  };

  return (
    <form onSubmit={handleSearch}>
      {/* Search input field */}
      <input
        type="text"
        placeholder="Search for companies, industries, or keywords..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Search button */}
      <button type="submit" disabled={loading}>
        {loading ? 'Searching...' : 'Find Prospects'}
      </button>

      {/* Error display */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default SearchForm;