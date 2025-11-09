import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        // Calls backend protected route: GET /api/users/me
        const res = await api.get('/users/me');
        if (!mounted) return;

        if (!res.ok) {
          if (res.status === 401) {
            setError('Not authenticated. Please log in.');
            setUser(null);
          } else {
            setError(res.data?.message || 'Failed to load user data.');
          }
        } else {
          // backend returns { user: { ... } }
          const found = res.data?.user ?? res.data;
          setUser(found);
        }
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError('Could not fetch user data.');
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    api.clearToken();
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>

      {loading && <p style={styles.info}>Loading...</p>}

      {!loading && error && (
        <div style={styles.alert}>
          <p style={{ margin: 0 }}>{error}</p>
          <div style={{ marginTop: 8 }}>
            <Link to="/login" style={styles.link}>Login</Link>
            {' · '}
            <Link to="/signup" style={styles.link}>Sign Up</Link>
          </div>
        </div>
      )}

      {!loading && !error && !user && (
        <div>
          <p style={styles.info}>No user data. Try logging in:</p>
          <Link to="/login" style={styles.button}>Go to Login</Link>
        </div>
      )}

      {!loading && user && (
        <div>
          <p style={styles.welcome}>
            Welcome, <strong>{user.username ?? user.name ?? user.email}</strong>
          </p>

          <div style={styles.card}>
            <h3 style={{ marginTop: 0 }}>Account summary (sample)</h3>
            <p style={{ margin: '6px 0' }}>This is static sample content for testing UI.</p>
            <ul>
              <li>Checking — ACC0001 — $1,000.00</li>
              <li>Savings — ACC0002 — $500.00</li>
            </ul>
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 760,
    margin: '40px auto',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    color: '#111827'
  },
  title: { fontSize: 24, marginBottom: 12 },
  welcome: { fontSize: 16, color: '#111827' },
  info: { color: '#6b7280' },
  alert: {
    padding: 12,
    background: '#fff7ed',
    border: '1px solid #ffedd5',
    borderRadius: 6,
    color: '#92400e'
  },
  card: {
    marginTop: 12,
    padding: 12,
    borderRadius: 6,
    background: '#f3f4f6',
    border: '1px solid #e5e7eb'
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600
  },
  button: {
    display: 'inline-block',
    padding: '8px 12px',
    background: '#2563eb',
    color: '#fff',
    textDecoration: 'none',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600
  }
};