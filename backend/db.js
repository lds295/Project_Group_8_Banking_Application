const { Pool } = require('pg');
require('dotenv').config();

// The pool will use environment variables
// (PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT)
// by default, or you can pass them in an object.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Export a query function to be used by routes
module.exports = {
  query: (text, params) => pool.query(text, params),
};
