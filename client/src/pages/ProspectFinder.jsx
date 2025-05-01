import { useState } from 'react';

export default function ProspectFinder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null); // 📦 Track which row is expanded

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

  const toggleExpand = (index) => {
    // 🧠 If clicking same row, collapse it. If clicking different, expand new one.
    setExpandedRow(expandedRow === index ? null : index);
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
          placeholder="Search keywords..."
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
                <>
                  {/* Main Row */}
                  <tr key={idx} onClick={() => toggleExpand(idx)} className="text-center hover:bg-gray-100 cursor-pointer">
                    <td className="border px-4 py-2">{prospect.name || '—'}</td>
                    <td className="border px-4 py-2">{prospect.title || '—'}</td>
                    <td className="border px-4 py-2">
                    {prospect.link ? (
                     <a href={prospect.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    {new URL(prospect.link).hostname}
                     </a>
                      ) : '—'}

                    </td>
                    <td className="border px-4 py-2">
                      {prospect.emails && prospect.emails.length > 0 ? prospect.emails[0] : '—'}
                    </td>
                    <td className="border px-4 py-2">
                      {prospect.phones && prospect.phones.length > 0 ? prospect.phones[0] : '—'}
                    </td>
                    <td className="border px-4 py-2">{prospect.region || '—'}</td>
                    <td className="border px-4 py-2">{prospect.industry || '—'}</td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedRow === idx && (
                    <tr>
                      <td colSpan="7" className="bg-gray-50 p-4 text-left">
                        {/* Expanded content */}
                        <div className="space-y-2">
                          <div>
                            <strong>📧 Emails:</strong>
                            <ul className="list-disc list-inside">
                              {(prospect.emails && prospect.emails.length > 0) ? (
                                prospect.emails.map((email, emailIdx) => (
                                  <li key={emailIdx}>{email}</li>
                                ))
                              ) : (
                                <li>—</li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <strong>📞 Phones:</strong>
                            <ul className="list-disc list-inside">
                              {(prospect.phones && prospect.phones.length > 0) ? (
                                prospect.phones.map((phone, phoneIdx) => (
                                  <li key={phoneIdx}>{phone}</li>
                                ))
                              ) : (
                                <li>—</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}