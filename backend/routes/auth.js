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
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'username, email and password are required' });

  try {
    const exists = await db.query('SELECT user_id FROM users WHERE email = $1 OR username = $2 LIMIT 1', [email, username]);
    if (exists.rows.length > 0) return res.status(409).json({ message: 'User already exists' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const insert = await db.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING user_id, username, email, created_at`,
      [username, email, password_hash]
    );

    const user = insert.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user });
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
    const q = await db.query('SELECT user_id, username, email, password_hash FROM users WHERE email = $1 LIMIT 1', [email]);
    const user = q.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: { user_id: user.user_id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;