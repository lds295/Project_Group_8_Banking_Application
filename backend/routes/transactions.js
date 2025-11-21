const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const currentUserId = req.user.user_id;

    const query = `
      SELECT 
        t.transaction_id, 
        t.amount, 
        t.note, 
        t.created_at,
        CASE 
            WHEN to_acc.user_id = $1 THEN 'IN'
            ELSE 'OUT'
        END as direction,
        COALESCE(from_acc.account_name, 'External') as sender_name,
        COALESCE(to_acc.account_name, 'External') as receiver_name
      FROM transactions t
      LEFT JOIN accounts from_acc ON t.from_account_id = from_acc.account_id
      LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.account_id
      WHERE from_acc.user_id = $1 OR to_acc.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT 10; 
    `;

    const result = await db.query(query, [currentUserId]);
    res.json({ transactions: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

module.exports = router;