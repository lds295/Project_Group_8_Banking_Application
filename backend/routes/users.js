const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const q = await db.query('SELECT user_id, username, email, created_at FROM users WHERE user_id = $1 LIMIT 1', [req.user.user_id]);
    if (!q.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json({ user: q.rows[0] });
  } catch (err) {
    console.error('GET /users/me error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;