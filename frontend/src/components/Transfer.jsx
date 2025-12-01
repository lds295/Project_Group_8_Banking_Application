import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Transfer() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: '',
    note: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load user's accounts for the dropdowns
  useEffect(() => {
    const fetchAccounts = async () => {
        try {
            const res = await api.get('/accounts');
            if (res.ok && res.data.accounts) {
                setAccounts(res.data.accounts);
                // Default "From" to the first account (usually checking)
                if (res.data.accounts.length > 0) {
                    setFormData(prev => ({
                        ...prev, 
                        from_account_id: res.data.accounts[0].account_id 
                    }));
                }
            }
        } catch (err) {
            console.error("Failed to load accounts");
        }
    };
    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.from_account_id === formData.to_account_id) {
        setLoading(false);
        return setError("Cannot transfer to the same account.");
    }

    try {
        const res = await api.post('/transactions/transfer', formData);
        if (!res.ok) {
            setError(res.data?.message || "Transfer failed");
        } else {
            // Success! Go back home
            navigate('/home');
        }
    } catch (err) {
        setError("An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Transfer Money</h2>
      
      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        
        {/* FROM ACCOUNT */}
        <div className="form-group">
            <label>From Account:</label>
            <select 
                name="from_account_id" 
                value={formData.from_account_id} 
                onChange={handleChange}
                className="form-select"
                required
            >
                {accounts.map(acc => (
                    <option key={acc.account_id} value={acc.account_id}>
                        {acc.account_name} (Balance: ${acc.balance})
                    </option>
                ))}
            </select>
        </div>

        {/* TO ACCOUNT */}
        <div className="form-group">
            <label>To Account:</label>
            <select 
                name="to_account_id" 
                value={formData.to_account_id} 
                onChange={handleChange}
                className="form-select"
                required
            >
                <option value="">Select Account</option>
                {accounts.map(acc => (
                    <option key={acc.account_id} value={acc.account_id}>
                        {acc.account_name}
                    </option>
                ))}
            </select>
        </div>

        {/* AMOUNT */}
        <div className="form-group">
            <label>Amount:</label>
            <input
                type="number"
                name="amount"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                className="form-input"
                min="0.01"
                step="0.01"
                required
            />
        </div>

        {/* NOTE */}
        <div className="form-group">
            <label>Note (Optional):</label>
            <input
                type="text"
                name="note"
                placeholder="e.g. Savings Goal"
                value={formData.note}
                onChange={handleChange}
                className="form-input"
            />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Transfer Funds'}
        </button>

        <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/home')}
        >
            Cancel
        </button>

      </form>
    </div>
  );
}