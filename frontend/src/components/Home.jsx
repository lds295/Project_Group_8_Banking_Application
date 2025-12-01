import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Home() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]); 
  const [transactions, setTransactions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {

        const [userRes, accountRes, txRes] = await Promise.all([
            api.get('/users/me'),
            api.get('/accounts'), 
            api.get('/transactions')
        ]);

        if (!mounted) return;

        // 1. Handle User Data
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

       
        if (accountRes.ok && accountRes.data && accountRes.data.accounts) {
            setAccounts(accountRes.data.accounts);
        } else {
            setAccounts([]); 
        }

       
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
    <div className="container dashboard-container">
      <h1 className="title">Dashboard</h1>

      {loading && <p className="info-text">Loading...</p>}
      {!loading && error && <div className="error-msg">{error}</div>}

      {!loading && user && (
        <div>
          <p className="welcome-text">Welcome, <strong>{user.username}</strong></p>
          
          {/* --- ACCOUNT SUMMARY --- */}
          
          <div className="card">
            <div className="card-header">
                <h3 style={{ margin: 0 }}>Account Summary</h3>
                <Link to="/transfer">
                    <button className="btn-transfer">Transfer Money</button>
                </Link>
            </div>

            {accounts.length === 0 ? (
                <p>No accounts found.</p>
            ) : (
                <ul className="list-group">
                    {accounts.map(acc => (
                        <li key={acc.account_id} className="list-item">
                            <div>
                                <strong>{acc.account_name}</strong>
                                <span className="text-muted">({acc.account_number})</span>
                            </div>
                            <div className="amount-text text-blue">
                                ${Number(acc.balance).toFixed(2)}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
          </div>

          {/* --- TRANSACTIONS LIST --- */}
          
          <div style={{ marginTop: 20 }}>
            <h3>Recent Activity</h3>
            {transactions.length === 0 ? (
              <p className="info-text">No recent activity.</p>
            ) : (
              <ul className="list-group">
                {transactions.map((t) => (
                  <li key={t.transaction_id} className="list-item">
                    <div>
                      <strong style={{ display: 'block' }}>
                        {t.direction === 'IN' 
                          ? `Received from ${t.sender_name}` 
                          : `Sent to ${t.receiver_name}`
                        }
                      </strong>
                      <span className="text-muted">{t.note || 'Transfer'}</span>
                    </div>
                    {/* Dynamic Colors: Green for IN, Red for OUT */}
                    <div className={`amount-text ${t.direction === 'IN' ? 'text-green' : 'text-red'}`}>
                      {t.direction === 'IN' ? '+' : '-'}${t.amount}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={handleLogout} className="btn btn-logout">Logout</button>
        </div>
      )}
    </div>
  );
}