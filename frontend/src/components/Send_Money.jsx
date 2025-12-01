import React, { useState, useEffect } from 'react';
import api from '../api';

export default function SendMoney() {
  const [user, setUser] = useState(null);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Fetch user info
        const res = await api.get('/users/me');
        if (!res.ok) return;
        const userData = res.data.user ?? res.data;

        // Fetch accounts
        const accRes = await api.get('/users/me/accounts');
        let checkingBalance = 0;
        if (accRes.ok && accRes.data.accounts) {
          const checkingAcc = accRes.data.accounts.find(acc =>
            acc.account_name.toLowerCase().includes('checking')
          );
          checkingBalance = checkingAcc ? parseFloat(checkingAcc.balance) : 0;
        }

        setUser({
          ...userData,
          checking_balance: checkingBalance
        });

      } catch (err) {
        console.error(err);
        setError('Failed to load user data.');
      }
    };

    fetchUser();
  }, []);

  const lookupRecipient = async () => {
    setError('');
    setRecipient(null);
    try {
      const res = await api.get(`/users/search?query=${recipientQuery}`);
      if (res.ok && res.data.user) {
        setRecipient(res.data.user);
      } else {
        setError('User not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to look up user.');
    }
  };

  const handleSend = async () => {
    setError('');
    setSuccess('');

    if (!recipient) {
      setError('Please select a recipient.');
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    if (parseFloat(amount) > (user.checking_balance || 0)) {
      setError('Insufficient balance.');
      return;
    }

    try {
      const res = await api.post('/transactions/send', {
        to_user_id: recipient.user_id,
        amount: parseFloat(amount),
        note,
      });

      if (res.ok) {
        setSuccess(`Sent $${parseFloat(amount).toFixed(2)} to ${recipient.username}`);
        setAmount('');
        setNote('');
        setRecipient(null);

        // Update local user balance
        setUser(prev => ({
          ...prev,
          checking_balance: (prev.checking_balance || 0) - parseFloat(amount)
        }));
      } else {
        setError(res.data?.message || 'Failed to send money.');
      }
    } catch (err) {
      console.error(err);
      setError('Error sending money.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Send Money</h1>

      {user && (
        <div style={styles.card}>
          <p><strong>Your Checking Balance:</strong> ${user.checking_balance?.toFixed(2) ?? '0.00'}</p>
        </div>
      )}

      <div style={styles.card}>
        <h3>Recipient Lookup</h3>
        <input
          type="text"
          placeholder="Enter email or phone"
          value={recipientQuery}
          onChange={(e) => setRecipientQuery(e.target.value)}
          style={styles.input}
        />
        <button onClick={lookupRecipient} style={styles.button}>Lookup</button>

        {recipient && (
          <p style={{ marginTop: 10 }}>Recipient: <strong>{recipient.username}</strong></p>
        )}
      </div>

      <div style={styles.card}>
        <h3>Send Details</h3>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.button}>Send</button>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: 10 }}>{success}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 600, margin: '40px auto', fontFamily: 'Arial' },
  card: { background: '#f3f4f6', padding: 15, borderRadius: 8, marginBottom: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: '100%', padding: 10, marginBottom: 10, borderRadius: 5, border: '1px solid #ccc' },
  button: { padding: '10px 15px', background: 'blue', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' },
};