// components/ResultsTable.jsx
import React from 'react';

export default function ResultsTable({
  results,
  expandedRow,
  toggleExpand,
  cellStyle
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.95rem',
          backgroundColor: '#2a2a2a',
          color: '#fff',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#333' }}>
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
          {results.map((prospect, idx) => (
            <React.Fragment key={idx}>
              {/* 🔹 Row: Summary view */}
              <tr
                onClick={() => toggleExpand(idx)}
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: expandedRow === idx ? '#383838' : '#2a2a2a',
                  borderBottom: '1px solid #444',
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
                      style={{ color: '#4eaaff', textDecoration: 'underline' }}
                    >
                      {new URL(prospect.link).hostname}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td style={cellStyle}>{prospect.emails?.[0] || '—'}</td>
                <td style={cellStyle}>{prospect.phones?.[0] || '—'}</td>
                <td style={cellStyle}>{prospect.region || '—'}</td>
                <td style={cellStyle}>{prospect.industry || '—'}</td>
              </tr>

              {/* 🔽 Row: Expanded detail view */}
              {expandedRow === idx && (
                <tr>
                  <td colSpan="7" style={{ backgroundColor: '#1c1c1c', padding: '1rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      <div>
                        <strong>📧 Emails:</strong>
                        <ul style={{ paddingLeft: '1rem' }}>
                          {prospect.emails?.length > 0 ? (
                            prospect.emails.map((email, i) => <li key={i}>{email}</li>)
                          ) : (
                            <li>—</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <strong>📞 Phones:</strong>
                        <ul style={{ paddingLeft: '1rem' }}>
                          {prospect.phones?.length > 0 ? (
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
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
