import { useState, useMemo, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ResultsTable from '../components/ResultsTable';

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
  const requestIdRef = useRef(0);

  const handleSearch = async (e) => {
    e.preventDefault();
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
      const thisRequestId = Date.now();
      requestIdRef.current = thisRequestId;
      const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      const data = await response.json();
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

  const handleCancelSearch = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
      setResults([]);
      setFilteredResults([]);
      fetch('http://localhost:3000/cancel', { method: 'POST' });
    }
  };

  const clearFilters = () => {
    setHasEmailOnly(false);
    setHasPhoneOnly(false);
    setSelectedRegion('');
    setSelectedIndustry('');
  };

  const toggleExpand = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const regions = useMemo(() => [...new Set(results.map(r => r.region).filter(Boolean))], [results]);
  const industries = useMemo(() => [...new Set(results.map(r => r.industry).filter(Boolean))], [results]);

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
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>
        ProspectFinder
      </h1>

      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        onCancel={handleCancelSearch}
        loading={loading}
      />

      {!loading && results.length > 0 && (
        <div style={{ backgroundColor: '#1e1e1e', padding: '1rem', borderRadius: '10px', marginBottom: '2rem' }}>
          <FilterPanel
            hasEmailOnly={hasEmailOnly}
            setHasEmailOnly={setHasEmailOnly}
            hasPhoneOnly={hasPhoneOnly}
            setHasPhoneOnly={setHasPhoneOnly}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedIndustry={selectedIndustry}
            setSelectedIndustry={setSelectedIndustry}
            regions={regions}
            industries={industries}
            clearFilters={clearFilters}
          />

          <ResultsTable
            results={filteredResults}
            expandedRow={expandedRow}
            toggleExpand={toggleExpand}
            cellStyle={cellStyle}
          />
        </div>
      )}
    </div>
  );
}

const cellStyle = {
  padding: '0.75rem 1rem',
  borderBottom: '1px solid #444',
};