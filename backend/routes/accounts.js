const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/accounts
// Fetch all accounts belonging to the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Select account info needed for the dashboard
    const result = await db.query(
      'SELECT account_id, account_number, account_name, balance FROM accounts WHERE user_id = $1 ORDER BY account_id',
      [userId]
    );

    res.json({ accounts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching accounts' });
  }
});

module.exports = router;