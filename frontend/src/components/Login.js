import React, { useState } from 'react';
import axios from 'axios';

const styles = {
  container: {
    maxWidth: 400,
    margin: '3rem auto',
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    padding: '2rem'
  },
  input: {
    width: '100%',
    padding: '0.7rem',
    margin: '0.5rem 0',
    borderRadius: 5,
    border: '1px solid #ccc',
    fontSize: 16
  },
  button: {
    width: '100%',
    padding: '0.8rem',
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    fontWeight: 'bold',
    fontSize: 16,
    cursor: 'pointer',
    marginTop: '1rem'
  },
  error: {
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center'
  }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } catch (e) {
      setErr('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.container}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Login</h2>
      {err && <div style={styles.error}>{err}</div>}
      <input style={styles.input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button style={styles.button} type="submit">Login</button>
    </form>
  );
}