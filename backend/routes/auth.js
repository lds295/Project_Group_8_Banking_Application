const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

function signToken(user) {
  return jwt.sign(
    { user_id: user.user_id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password, phone_number } = req.body;
  
  if (!username || !email || !password)
    return res.status(400).json({ message: 'username, email and password are required' });

  try {
    // 1. Check if user exists
    const exists = await db.query('SELECT user_id FROM users WHERE email = $1 OR username = $2 LIMIT 1', [email, username]);
    if (exists.rows.length > 0) return res.status(409).json({ message: 'User already exists' });

    // 2. Create the User
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // We insert the user and get the new ID back
    const userInsert = await db.query(
      `INSERT INTO users (username, email, password_hash, phone_number)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, username, email, phone_number, created_at`,
      [username, email, password_hash, phone_number]
    );

    const newUser = userInsert.rows[0];
    const newUserId = newUser.user_id;

    // --- AUTOMATIC ACCOUNT CREATION START ---

    // 3. Create a Checking Account (Start with $1,000)
    // We generate a random account number using the UserID + Timestamp to keep it unique
    const checkingNum = `CHK-${newUserId}-${Date.now()}`;
    await db.query(
      `INSERT INTO accounts (user_id, account_number, account_name, balance, currency)
       VALUES ($1, $2, $3, $4, 'USD')`,
      [newUserId, checkingNum, `${username}'s Checking`, 100000.00]
    );

    // 4. Create a Savings Account (Start with $500)
    const savingsNum = `SAV-${newUserId}-${Date.now()}`;
    await db.query(
      `INSERT INTO accounts (user_id, account_number, account_name, balance, currency)
       VALUES ($1, $2, $3, $4, 'USD')`,
      [newUserId, savingsNum, `${username}'s Savings`, 50000.00]
    );

    // --- AUTOMATIC ACCOUNT CREATION END ---

    // 5. Sign token and finish
    const token = signToken(newUser);
    res.status(201).json({ token, user: newUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });

  try {
    const q = await db.query('SELECT user_id, username, email, password_hash, phone_number FROM users WHERE email = $1 LIMIT 1', [email]);
    const user = q.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: { user_id: user.user_id, username: user.username, email: user.email, phone_number: user.phone_number } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;