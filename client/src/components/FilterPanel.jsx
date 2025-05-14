// components/FilterPanel.jsx
import React from 'react';

export default function FilterPanel({
  hasEmailOnly,
  setHasEmailOnly,
  hasPhoneOnly,
  setHasPhoneOnly,
  selectedRegion,
  setSelectedRegion,
  selectedIndustry,
  setSelectedIndustry,
  regions,
  industries,
  clearFilters
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
      {/* ✅ Toggle: Has Email */}
      <label>
        <input
          type="checkbox"
          checked={hasEmailOnly}
          onChange={() => setHasEmailOnly(!hasEmailOnly)}
        />
        Has Email
      </label>

      {/* ✅ Toggle: Has Phone */}
      <label>
        <input
          type="checkbox"
          checked={hasPhoneOnly}
          onChange={() => setHasPhoneOnly(!hasPhoneOnly)}
        />
        Has Phone
      </label>

      {/* 🌍 Region Dropdown */}
      <select
        value={selectedRegion}
        onChange={(e) => setSelectedRegion(e.target.value)}
        style={{
          backgroundColor: '#333',
          color: '#fff',
          border: '1px solid #555',
          borderRadius: '6px',
          padding: '0.5rem',
        }}
      >
        <option value="">All Regions</option>
        {regions.map((r, i) => (
          <option key={i} value={r}>
            {r}
          </option>
        ))}
      </select>

      {/* 🏭 Industry Dropdown */}
      <select
        value={selectedIndustry}
        onChange={(e) => setSelectedIndustry(e.target.value)}
        style={{
          backgroundColor: '#333',
          color: '#fff',
          border: '1px solid #555',
          borderRadius: '6px',
          padding: '0.5rem',
        }}
      >
        <option value="">All Industries</option>
        {industries.map((r, i) => (
          <option key={i} value={r}>
            {r}
          </option>
        ))}
      </select>

      {/* ❌ Clear All Button */}
      <button
        type="button"
        onClick={clearFilters}
        style={{
          backgroundColor: '#888',
          color: '#fff',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Clear All
      </button>
    </div>
  );
}