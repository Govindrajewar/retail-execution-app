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
  section: {
    marginBottom: '2rem'
  },
  list: {
    listStyle: 'none',
    padding: 0
  },
  listItem: {
    padding: '0.7rem 0',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  button: {
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    marginLeft: 10
  },
  link: {
    color: '#1976d2',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginRight: 15
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: {
    background: '#fff', padding: 24, borderRadius: 8, maxWidth: 600, width: '90%', boxShadow: '0 2px 16px rgba(0,0,0,0.15)'
  }
};

export default function Dashboard() {
  const [audits, setAudits] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/audits/my', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAudits(res.data));

    axios.get('http://localhost:5000/api/templates', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const parsedTemplates = res.data.map(t => ({
        ...t,
        sections: typeof t.sections === 'string' ? JSON.parse(t.sections) : t.sections,
        scoring_rules: typeof t.scoring_rules === 'string' ? JSON.parse(t.scoring_rules) : t.scoring_rules
      }));
      setTemplates(parsedTemplates);
    });
  }, [token]);

  const handleViewTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleCloseTemplate = () => {
    setSelectedTemplate(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h2>My Audits</h2>
        <ul style={styles.list}>
          {audits.map(a => (
            <li style={styles.listItem} key={a.audit_id}>
              <span>
                <b>{a.template_name}</b> <span style={{ color: '#888' }}>({a.status})</span>
              </span>
              <a style={styles.button} href={`/audits/${a.audit_id}`}>Execute</a>
            </li>
          ))}
        </ul>
      </div>
      <div style={styles.section}>
        <h2>Templates</h2>
        <ul style={styles.list}>
          {templates.map(t => (
            <li style={styles.listItem} key={t.template_id}>
              <span>
                <b>{t.name}</b> <span style={{ color: '#888' }}>({t.category})</span>
              </span>
              <button style={styles.button} onClick={() => handleViewTemplate(t)}>View</button>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: 30 }}>
        <a style={styles.link} href="/templates/new">Create New Template</a>
        <a style={styles.link} href="/reports">Reports</a>
      </div>
      {selectedTemplate && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>{selectedTemplate.name}</h3>
            <p><b>Category:</b> {selectedTemplate.category}</p>
            <p><b>Description:</b> {selectedTemplate.description}</p>
            <h4>Sections</h4>
            <ul>
              {selectedTemplate.sections && selectedTemplate.sections.map((s, idx) => (
                <li key={idx}>
                  <b>{s.title}</b>
                  <ul>
                    {s.questions && s.questions.map((q, qidx) => (
                      <li key={qidx}>
                        {q.text} <span style={{ color: '#888' }}>({q.type})</span>
                        {q.options && q.options.length > 0 && (
                          <span style={{ color: '#1976d2' }}> [Options: {q.options.join(', ')}]</span>
                        )}
                        {q.mandatory && <span style={{ color: 'red', marginLeft: 5 }}>*</span>}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <button style={styles.button} onClick={handleCloseTemplate}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}