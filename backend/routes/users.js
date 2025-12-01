const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const q = await db.query('SELECT user_id, username, email, created_at, phone_number FROM users WHERE user_id = $1 LIMIT 1', [req.user.user_id]);
    if (!q.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json({ user: q.rows[0] });
  } catch (err) {
    console.error('GET /users/me error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users/search?query=emailOrPhone
router.get('/search', auth, async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: 'Query is required' });

  try {
    const result = await db.query(
      `SELECT user_id, username, email, phone_number 
       FROM users 
       WHERE email = $1 OR phone_number = $1
       LIMIT 1`,
      [query]
    );

    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('GET /users/search error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users/me/accounts
router.get('/me/accounts', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT account_id, account_number, account_name, balance, currency FROM accounts WHERE user_id=$1',
      [req.user.user_id]
    );
    res.json({ accounts: result.rows });
  } catch (err) {
    console.error('GET /users/me/accounts error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;