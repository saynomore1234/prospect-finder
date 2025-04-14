import React, { useState } from 'react';
// Import the SearchForm component we just built
import SearchForm from './components/SearchForm';

function App() {
  // State to store search results returned from backend
  const [results, setResults] = useState(null);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🕵️ Prospect Finder</h1>

      {/* Pass a function to SearchForm to handle result callback */}
      <SearchForm onResults={setResults} />

      {/* Show results as raw JSON for now (we’ll format it later) */}
      {results && (
        <div style={{ marginTop: '2rem' }}>
          <h2>🔍 Search Results</h2>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;