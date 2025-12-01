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
// POST /api/transactions/send
router.post('/send', auth, async (req, res) => {
  const { to_user_id, amount, note } = req.body;
  const from_user_id = req.user.user_id;

  if (!to_user_id || !amount) {
    return res.status(400).json({ message: 'Recipient and amount are required' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Get sender and recipient checking accounts
    const fromAccRes = await client.query(
      "SELECT account_id, balance FROM accounts WHERE user_id=$1 AND account_name LIKE '%Checking%'",
      [from_user_id]
    );
    const toAccRes = await client.query(
      "SELECT account_id, balance FROM accounts WHERE user_id=$1 AND account_name LIKE '%Checking%'",
      [to_user_id]
    );

    if (!fromAccRes.rows[0] || !toAccRes.rows[0]) {
      throw new Error('Sender or recipient account not found');
    }

    if (parseFloat(fromAccRes.rows[0].balance) < parseFloat(amount)) {
      throw new Error('Insufficient balance');
    }

    // Deduct from sender
    await client.query(
      'UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE account_id = $2',
      [amount, fromAccRes.rows[0].account_id]
    );

    // Add to recipient
    await client.query(
      'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE account_id = $2',
      [amount, toAccRes.rows[0].account_id]
    );

    // Insert transaction
    await client.query(
      'INSERT INTO transactions (from_account_id, to_account_id, amount, note) VALUES ($1, $2, $3, $4)',
      [fromAccRes.rows[0].account_id, toAccRes.rows[0].account_id, amount, note || null]
    );

    await client.query('COMMIT');
    res.json({ ok: true, message: `Sent $${amount} successfully` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /transactions/send error', err);
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
});
// POST /api/transactions/transfer
// Body expects: { from_account_id, to_account_id, amount, note }
router.post('/transfer', auth, async (req, res) => {
  const { from_account_id, to_account_id, amount, note } = req.body;
  const numericAmount = parseFloat(amount);

  if (!from_account_id || !to_account_id || numericAmount <= 0) {
    return res.status(400).json({ message: 'Invalid transfer details' });
  }

  // Start a Database Client
  const client = await db.pool.connect();

  try {
    // 1. BEGIN TRANSACTION (Start safe mode)
    await client.query('BEGIN');

    // 2. CHECK SENDER BALANCE
    const senderRes = await client.query(
      'SELECT balance FROM accounts WHERE account_id = $1 FOR UPDATE', 
      [from_account_id]
    );
    
    if (senderRes.rows.length === 0) {
       throw new Error('Sender account not found');
    }

    const currentBalance = parseFloat(senderRes.rows[0].balance);
    if (currentBalance < numericAmount) {
        throw new Error('Insufficient funds');
    }

    // 3. DEDUCT FROM SENDER
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2',
      [numericAmount, from_account_id]
    );

    // 4. ADD TO RECEIVER
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2',
      [numericAmount, to_account_id]
    );

    // 5. RECORD THE TRANSACTION HISTORY
    await client.query(
      `INSERT INTO transactions (from_account_id, to_account_id, amount, note)
       VALUES ($1, $2, $3, $4)`,
      [from_account_id, to_account_id, numericAmount, note]
    );

    // 6. COMMIT (Save everything)
    await client.query('COMMIT');
    
    res.json({ message: 'Transfer successful' });

  } catch (err) {
    // IF ERROR: ROLLBACK (Undo everything)
    await client.query('ROLLBACK');
    console.error('Transfer error', err);
    res.status(400).json({ message: err.message || 'Transfer failed' });
  } finally {
    client.release();
  }
});