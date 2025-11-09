// --- Imports ---
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Loads .env file contents into process.env

// --- Route Imports ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// --- App Initialization ---
const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing for your React app
app.use(cors({
  origin: 'http://localhost:3000' // Adjust for your React app's URL
}));

// Parse incoming JSON requests
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// A simple test route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// --- Server Listener ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
