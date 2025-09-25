import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const styles = {
  container: {
    maxWidth: 800,
    margin: '2rem auto',
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    padding: '2rem'
  },
  section: {
    marginBottom: 30
  },
  question: {
    marginBottom: 15
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10
  },
  input: {
    padding: '0.5rem',
    borderRadius: 5,
    border: '1px solid #ccc',
    width: '60%'
  },
  button: {
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    padding: '0.7rem 2rem',
    fontWeight: 'bold',
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 20
  }
};

export default function AuditExecution() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [template, setTemplate] = useState(null);
  const [responses, setResponses] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/audits/my`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const a = res.data.find(a => a.audit_id === id);
      setAudit(a);
      axios.get(`http://localhost:5000/api/templates/${a.template_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setTemplate(res.data));
    });
  }, [id, token]);

  if (!audit || !template) return <div style={styles.container}>Loading...</div>;

  const handleChange = (sectionIdx, questionIdx, value) => {
    setResponses({
      ...responses,
      [template.sections[sectionIdx].title]: {
        ...responses[template.sections[sectionIdx].title],
        [template.sections[sectionIdx].questions[questionIdx].text]: value
      }
    });
  };

  const handleSubmit = async () => {
    await axios.put(`http://localhost:5000/api/audits/${id}/submit`, { responses, score: 100 }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    window.location.href = '/dashboard';
  };

  return (
    <div style={styles.container}>
      <h2>Audit: {template.name}</h2>
      {template.sections.map((section, sidx) => (
        <div style={styles.section} key={sidx}>
          <h3>{section.title}</h3>
          {section.questions.map((q, qidx) => (
            <div style={styles.question} key={qidx}>
              <label style={styles.label}>{q.text}</label>
              <input style={styles.input} onChange={e => handleChange(sidx, qidx, e.target.value)} />
            </div>
          ))}
        </div>
      ))}
      <button style={styles.button} onClick={handleSubmit}>Submit Audit</button>
    </div>
  );
}