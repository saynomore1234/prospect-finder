// components/SearchBar.jsx
import React from 'react';

// 🔍 SearchBar component handles:
// - The search input box
// - The "Find Prospects" button
// - The Cancel button (only if loading is true)

export default function SearchBar({
  query,            // current search text
  onQueryChange,    // function to update the query state
  onSearch,         // function triggered when form is submitted
  onCancel,         // function triggered when Cancel button is clicked
  loading           // boolean: true if search is in progress
}) {
  return (
    <form
      onSubmit={onSearch} // 🔁 Trigger search function from props
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '3rem',
      }}
    >
      {/* 🔤 Search input box */}
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)} // 🧠 Update query state on input change
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

      {/* 🔘 Search Button */}
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

      {/* ❌ Cancel Button (only shown when loading is true) */}
      {loading && (
        <button
          type="button"
          onClick={onCancel}
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
  );
}
