import React, { useEffect, useState } from 'react';
import axios from 'axios';

const styles = {
  container: {
    maxWidth: 1000,
    margin: '2rem auto',
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    padding: '2rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: 30
  },
  th: {
    background: '#1976d2',
    color: '#fff',
    padding: '0.7rem'
  },
  td: {
    padding: '0.7rem',
    borderBottom: '1px solid #eee'
  },
  button: {
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    padding: '0.4rem 1rem',
    cursor: 'pointer'
  },
  breakdown: {
    background: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginTop: 20
  }
};

export default function Reports() {
  const [compliance, setCompliance] = useState([]);
  const [breakdown, setBreakdown] = useState(null);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/reports/compliance', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setCompliance(res.data));
  }, [token]);

  const handleBreakdown = (audit_id) => {
    setSelectedAudit(audit_id);
    axios.get(`http://localhost:5000/api/reports/breakdown/${audit_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setBreakdown(res.data));
  };

  return (
    <div style={styles.container}>
      <h2>Compliance Report</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Audit ID</th>
            <th style={styles.th}>Score</th>
            <th style={styles.th}>Template</th>
            <th style={styles.th}>Auditor</th>
            <th style={styles.th}>Breakdown</th>
          </tr>
        </thead>
        <tbody>
          {compliance.map(r => (
            <tr key={r.audit_id}>
              <td style={styles.td}>{r.audit_id}</td>
              <td style={styles.td}>{r.score}</td>
              <td style={styles.td}>{r.template_name}</td>
              <td style={styles.td}>{r.auditor_name}</td>
              <td style={styles.td}>
                <button style={styles.button} onClick={() => handleBreakdown(r.audit_id)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {breakdown && (
        <div style={styles.breakdown}>
          <h3>Section-wise Breakdown for Audit {selectedAudit}</h3>
          <pre>{JSON.stringify(breakdown, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}