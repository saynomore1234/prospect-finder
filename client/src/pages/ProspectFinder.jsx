import { useState } from 'react';

export default function ProspectFinder() {
  // Store the query text
  const [query, setQuery] = useState('');
  // Store results returned from backend
  const [results, setResults] = useState([]);
  // Track loading state
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setResults([]);

      const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Error fetching prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 p-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-8">ProspectFinder</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex justify-center mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for companies, industries, or keywords..."
          className="border border-gray-300 px-4 py-2 rounded-l-md w-1/2"
        />
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded-r-md hover:bg-gray-800"
        >
          Find Prospects
        </button>
      </form>

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center text-lg">Loading...</div>
      )}

      {/* Results Table */}
      {!loading && results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Title</th>
                <th className="border px-4 py-2">Website</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Phone</th>
                <th className="border px-4 py-2">Region</th>
                <th className="border px-4 py-2">Industry</th>
              </tr>
            </thead>
            <tbody>
              {results.map((prospect, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border px-4 py-2">{prospect.name || '—'}</td>
                  <td className="border px-4 py-2">{prospect.title || '—'}</td>
                  <td className="border px-4 py-2">
                    {prospect.website ? (
                      <a href={prospect.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        {prospect.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="border px-4 py-2">{prospect.email || '—'}</td>
                  <td className="border px-4 py-2">{prospect.phone || '—'}</td>
                  <td className="border px-4 py-2">{prospect.region || '—'}</td>
                  <td className="border px-4 py-2">{prospect.industry || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}