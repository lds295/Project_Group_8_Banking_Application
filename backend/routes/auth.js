const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- /api/auth/register ---
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // TODO: 1. Validate input (e.g., check if fields are empty)

    // TODO: 2. Check if user (username or email) already exists
    // const userCheck = await db.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username]);
    // if (userCheck.rows.length > 0) {
    //   return res.status(400).json({ error: "User already exists" });
    // }

    // TODO: 3. Hash the password
    // const salt = await bcrypt.genSalt(10);
    // const passwordHash = await bcrypt.hash(password, salt);

    // TODO: 4. Insert the new user into the database
    // const newUser = await db.query(
    //   "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email",
    //   [username, email, passwordHash]
    // );

    // TODO: 5. Generate a JWT token
    // const token = jwt.sign(
    //   { userId: newUser.rows[0].user_id },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '1h' }
    // );

    // TODO: 6. Send response with token and user info
    // res.status(201).json({ token, user: newUser.rows[0] });

    // Placeholder response
    res.status(201).json({ message: 'Register endpoint outline', data: req.body });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- /api/auth/login ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // TODO: 1. Validate input

    // TODO: 2. Find the user by email
    // const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    // if (user.rows.length === 0) {
    //   return res.status(400).json({ error: "Invalid credentials" });
    // }

    // TODO: 3. Compare the provided password with the stored hash
    // const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    // if (!isMatch) {
    //   return res.status(400).json({ error: "Invalid credentials" });
    // }

    // TODO: 4. Generate a JWT token
    // const token = jwt.sign(
    //   { userId: user.rows[0].user_id },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '1h' }
    // );

    // TODO: 5. Send response with token and user info
    // res.json({ token, user: { ... } }); // Don't send the password hash!

    // Placeholder response
    res.status(200).json({ message: 'Login endpoint outline', data: req.body });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;