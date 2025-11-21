import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Home() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]); // NEW STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // FETCH BOTH USER AND TRANSACTIONS
        const [userRes, txRes] = await Promise.all([
            api.get('/users/me'),
            api.get('/transactions')
        ]);

        if (!mounted) return;

        // Handle User Logic
        if (!userRes.ok) {
          if (userRes.status === 401) {
            setError('Not authenticated. Please log in.');
            setUser(null);
          } else {
            setError(userRes.data?.message || 'Failed to load user data.');
          }
        } else {
          setUser(userRes.data?.user ?? userRes.data);
        }

        // Handle Transaction Logic
        if (txRes.ok && txRes.data && txRes.data.transactions) {
            setTransactions(txRes.data.transactions);
        } else {
            setTransactions([]);
        }

      } catch (err) {
        console.error(err);
        if (mounted) setError('Could not fetch data.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
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
      {!loading && error && <div style={styles.alert}>{error}</div>}

      {!loading && user && (
        <div>
          <p style={styles.welcome}>Welcome, <strong>{user.username}</strong></p>
          
          {/* EXISTING ACCOUNTS CARD */}
          <div style={styles.card}>
            <h3>Account Summary</h3>
            <ul>
               <li>Checking - ACC001 - $1,000.00</li>
               <li>Savings - ACC002 - $500.00</li>
            </ul>
          </div>

          {/* --- NEW TRANSACTIONS LIST --- */}
          <div style={{ marginTop: 20 }}>
            <h3>Recent Transfers</h3>
            {transactions.length === 0 ? (
              <p style={styles.info}>No recent activity.</p>
            ) : (
              <ul style={styles.list}>
                {transactions.map((t) => (
                  <li key={t.transaction_id} style={styles.listItem}>
                    <div>
                      <strong style={{ display: 'block' }}>
                        {t.direction === 'IN' 
                          ? `Received from ${t.sender_name}` 
                          : `Sent to ${t.receiver_name}`
                        }
                      </strong>
                      <span style={{ fontSize: '0.85em', color: '#666' }}>{t.note}</span>
                    </div>
                    <div style={{ 
                        fontWeight: 'bold', 
                        color: t.direction === 'IN' ? 'green' : 'red' 
                    }}>
                      {t.direction === 'IN' ? '+' : '-'}${t.amount}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={handleLogout} style={styles.button}>Logout</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 760, margin: '40px auto', padding: 20, fontFamily: 'Arial' },
  card: { background: '#f3f4f6', padding: 15, borderRadius: 8, marginBottom: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  welcome: { fontSize: 18, marginBottom: 10 },
  button: { padding: '10px 15px', background: 'blue', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', marginTop: 20 },
  
  // NEW STYLES FOR LIST
  list: { listStyle: 'none', padding: 0, border: '1px solid #eee', borderRadius: 5 },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }
};