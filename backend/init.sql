-- Users table (matches your auth.js)
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  account_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  account_number TEXT NOT NULL UNIQUE,
  account_name TEXT,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transactions table (simple ledger)
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id SERIAL PRIMARY KEY,
  from_account_id INTEGER REFERENCES accounts(account_id) ON DELETE SET NULL,
  to_account_id INTEGER REFERENCES accounts(account_id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Simple seed data for testing: two users and two accounts
-- WARNING: If you run more than once, adjust or delete duplicates.

INSERT INTO users (username, email, password_hash)
VALUES
  ('alice', 'alice@example.com', 'password12'),
  ('bob',   'bob@example.com',   'password')
ON CONFLICT (email) DO NOTHING;

-- Create test accounts for alice and bob with distinct account_numbers
INSERT INTO accounts (user_id, account_number, account_name, balance, currency)
SELECT u.user_id, concat('ACC', u.user_id, '001'), concat(u.username, '''s Checking'), 1000.00, 'USD'
FROM users u
WHERE u.username = 'alice'
ON CONFLICT (account_number) DO NOTHING;

INSERT INTO accounts (user_id, account_number, account_name, balance, currency)
SELECT u.user_id, concat('ACC', u.user_id, '002'), concat(u.username, '''s Savings'), 500.00, 'USD'
FROM users u
WHERE u.username = 'bob'
ON CONFLICT (account_number) DO NOTHING;