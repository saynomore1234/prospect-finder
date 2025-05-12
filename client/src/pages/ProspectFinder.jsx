import { useState, useMemo, useRef } from 'react';

// 🔍 Minimalist Prospect Finder UI Component with post-search filters
export default function ProspectFinder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [hasEmailOnly, setHasEmailOnly] = useState(false);
  const [hasPhoneOnly, setHasPhoneOnly] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [abortController, setAbortController] = useState(null);
  const requestIdRef = useRef(0); // 🆔 Track which request is the latest

  // 🔍 Main search handler
  const handleSearch = async (e) => {
    e.preventDefault();

    // ✅ Abort any previous request
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }

    if (!query.trim()) return;

    try {
      setLoading(true);
      setResults([]);
      setFilteredResults([]);

      const controller = new AbortController();
      setAbortController(controller);

      // 🆔 Create and store a unique request ID
      const thisRequestId = Date.now();
      requestIdRef.current = thisRequestId;

      const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });

      const data = await response.json();

      // ✅ Only allow update if request ID matches
      if (requestIdRef.current === thisRequestId && data.results) {
        setResults(data.results);
        setFilteredResults(data.results);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching prospects:', error);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  // 🛑 Cancel fetch
  const handleCancelSearch = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
      setResults([]);
      setFilteredResults([]);
  
      // 🔗 NEW: Call backend to stop scraping job
      fetch('http://localhost:3000/cancel', { method: 'POST' });
    }
  };

  // 🧹 Clear filters
  const clearFilters = () => {
    setHasEmailOnly(false);
    setHasPhoneOnly(false);
    setSelectedRegion('');
    setSelectedIndustry('');
  };

  // 🔁 Expand/collapse row logic
  const toggleExpand = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // 🧠 Unique region/industry values
  const regions = useMemo(() => [...new Set(results.map(r => r.region).filter(Boolean))], [results]);
  const industries = useMemo(() => [...new Set(results.map(r => r.industry).filter(Boolean))], [results]);

  // 🧹 Filtered output when toggles or dropdowns are changed
  useMemo(() => {
    let filtered = results;

    if (hasEmailOnly) {
      filtered = filtered.filter(r => r.emails && r.emails.length > 0);
    }

    if (hasPhoneOnly) {
      filtered = filtered.filter(r => r.phones && r.phones.length > 0);
    }

    if (selectedRegion) {
      filtered = filtered.filter(r => r.region === selectedRegion);
    }

    if (selectedIndustry) {
      filtered = filtered.filter(r => r.industry === selectedIndustry);
    }

    setFilteredResults(filtered);
  }, [hasEmailOnly, hasPhoneOnly, selectedRegion, selectedIndustry, results]);

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem', color: '#f1f1f1' }}>
        ProspectFinder
      </h1>

      <form
        onSubmit={handleSearch}
        style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem' }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. IT manager philippines site:*.ph"
          style={{
            width: '50%',
            padding: '0.75rem 1rem',
            border: '1px solid #999',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            backgroundColor: '#333',
            color: '#f1f1f1',
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Find Prospects
        </button>
        {loading && (
          <button
            type="button"
            onClick={handleCancelSearch}
            style={{
              backgroundColor: '#999',
              color: '#fff',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* 🔘 Filter Bar */}
      {!loading && results.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <label>
            <input type="checkbox" checked={hasEmailOnly} onChange={() => setHasEmailOnly(!hasEmailOnly)} /> Has Email
          </label>
          <label>
            <input type="checkbox" checked={hasPhoneOnly} onChange={() => setHasPhoneOnly(!hasPhoneOnly)} /> Has Phone
          </label>
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
            <option value="">All Regions</option>
            {regions.map((r, i) => <option key={i} value={r}>{r}</option>)}
          </select>
          <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)}>
            <option value="">All Industries</option>
            {industries.map((r, i) => <option key={i} value={r}>{r}</option>)}
          </select>
          <button
            type="button"
            onClick={clearFilters}
            style={{
              backgroundColor: '#e5e5e5',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

      {!loading && filteredResults.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead style={{ backgroundColor: '#f3f3f3' }}>
              <tr>
                <th style={cellStyle}>Name</th>
                <th style={cellStyle}>Title</th>
                <th style={cellStyle}>Website</th>
                <th style={cellStyle}>Email</th>
                <th style={cellStyle}>Phone</th>
                <th style={cellStyle}>Region</th>
                <th style={cellStyle}>Industry</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((prospect, idx) => (
                <>
                  <tr
                    key={idx}
                    onClick={() => toggleExpand(idx)}
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: expandedRow === idx ? '#f9f9f9' : 'white',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <td style={cellStyle}>{prospect.name || '—'}</td>
                    <td style={cellStyle}>{prospect.title || '—'}</td>
                    <td style={cellStyle}>
                      {prospect.link ? (
                        <a
                          href={prospect.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#007bff', textDecoration: 'underline' }}
                        >
                          {new URL(prospect.link).hostname}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={cellStyle}>
                      {prospect.emails && prospect.emails.length > 0 ? prospect.emails[0] : '—'}
                    </td>
                    <td style={cellStyle}>
                      {prospect.phones && prospect.phones.length > 0 ? prospect.phones[0] : '—'}
                    </td>
                    <td style={cellStyle}>{prospect.region || '—'}</td>
                    <td style={cellStyle}>{prospect.industry || '—'}</td>
                  </tr>
                  {expandedRow === idx && (
                    <tr>
                      <td colSpan="7" style={{ backgroundColor: '#fcfcfc', padding: '1rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                          <div>
                            <strong>📧 Emails:</strong>
                            <ul style={{ paddingLeft: '1rem' }}>
                              {prospect.emails && prospect.emails.length > 0 ? (
                                prospect.emails.map((email, i) => <li key={i}>{email}</li>)
                              ) : (
                                <li>—</li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <strong>📞 Phones:</strong>
                            <ul style={{ paddingLeft: '1rem' }}>
                              {prospect.phones && prospect.phones.length > 0 ? (
                                prospect.phones.map((phone, i) => <li key={i}>{phone}</li>)
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

const cellStyle = {
  padding: '0.75rem 1rem',
  borderBottom: '1px solid #eee',
};