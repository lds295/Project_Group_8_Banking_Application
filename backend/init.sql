-- ==============================================
-- USERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================
-- ACCOUNTS TABLE
-- ==============================================
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

-- ==============================================
-- TRANSACTIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id SERIAL PRIMARY KEY,
  from_account_id INTEGER REFERENCES accounts(account_id) ON DELETE SET NULL,
  to_account_id INTEGER REFERENCES accounts(account_id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================
-- OPTIONAL TRANSACTION HISTORY VIEW (JOINED TABLE) if we want a diff way to display
-- ==============================================
CREATE OR REPLACE VIEW transaction_history AS
SELECT
    t.transaction_id,
    t.created_at,
    t.amount,
    t.note,
    fa.account_number AS from_account,
    fa.account_name   AS from_name,
    ta.account_number AS to_account,
    ta.account_name   AS to_name
FROM transactions t
LEFT JOIN accounts fa ON t.from_account_id = fa.account_id
LEFT JOIN accounts ta ON t.to_account_id = ta.account_id
ORDER BY t.transaction_id;

-- ==============================================
-- INSERT USERS
-- ==============================================
INSERT INTO users (username, email, password_hash, phone_number)
VALUES
  ('alice', 'alice@example.com', 'password12','928-444-2266'),
  ('bob',   'bob@example.com',   'password','480-123-9876')
ON CONFLICT (email) DO NOTHING;

-- ==============================================
-- INSERT ACCOUNTS
-- ==============================================

-- Alice account
INSERT INTO accounts (user_id, account_number, account_name, balance, currency)
SELECT u.user_id, 
       CONCAT('ACC', u.user_id, '001'),
       CONCAT(u.username, '''s Checking'),
       1000.00,
       'USD'
FROM users u
WHERE u.username = 'alice'
ON CONFLICT (account_number) DO NOTHING;

-- Bob account
INSERT INTO accounts (user_id, account_number, account_name, balance, currency)
SELECT u.user_id,
       CONCAT('ACC', u.user_id, '002'),
       CONCAT(u.username, '''s Savings'),
       500.00,
       'USD'
FROM users u
WHERE u.username = 'bob'
ON CONFLICT (account_number) DO NOTHING;

-- ==============================================
-- PREMADE TRANSACTIONS I did 4 each we can add more
-- ==============================================

-- -------------------------
-- ALICE TRANSACTIONS (4)
-- -------------------------

-- Alice sends $25 to Bob
INSERT INTO transactions (from_account_id, to_account_id, amount, note)
SELECT a1.account_id, a2.account_id, 25.00, 'Dinner split'
FROM accounts a1, accounts a2
WHERE a1.account_name LIKE 'alice%' AND a2.account_name LIKE 'bob%';

-- Alice receives $40 from Bob
INSERT INTO transactions (from_account_id, to_account_id, amount, note)
SELECT a2.account_id, a1.account_id, 40.00, 'Refund for groceries'
FROM accounts a1, accounts a2
WHERE a1.account_name LIKE 'alice%' AND a2.account_name LIKE 'bob%';

-- Alice deposit
INSERT INTO transactions (from_account_id, to_account_id, amount, note)
SELECT NULL, a1.account_id, 120.00, 'Paycheck deposit'
FROM accounts a1
WHERE a1.account_name LIKE 'alice%';

-- Alice internal transfer (Checking → Checking for example)
INSERT INTO transactions (from_account_id, to_account_id, amount, note)
SELECT a1.account_id, a1.account_id, 60.00, 'Internal transfer'
FROM accounts a1
WHERE a1.account_name LIKE 'alice%';

-- -------------------------
-- BOB TRANSACTIONS (4)
-- -------------------------

-- Bob sends $10 to Alice
INSERT INTO transactions (from_account_id, to_account_id, amount, note)
SELECT a2.account_id, a1.account_id, 10.00, 'Coffee reimbursement'
FROM accounts a1, accounts a2
WHERE a1.account_name LIKE 'alice%' AND a2.account_name LIKE 'bob%';

-- Bob receives $75 from Alice
INSERT INTO transactions (from_account_id, to_account_id, amount, note)
SELECT a1.account_id, a2.account_id, 75.00, 'Shared project payment'
FROM accounts a1, accounts a2
WHERE a1.account_name LIKE 'alice%' AND a2.account_name LIKE 'bob%';

-- Bob deposit
INSERT INTO transactions (from_account_id, to_account_id, amount, note)
SELECT NULL, a2.account_id, 200.00, 'Paycheck deposit'
FROM accounts a2
WHERE a2.account_name LIKE 'bob%';

-- Bob ATM withdrawal
INSERT INTO transactions (from_account_id, to_account_id, amount, note)
SELECT a2.account_id, NULL, 50.00, 'ATM withdrawal'
FROM accounts a2
WHERE a2.account_name LIKE 'bob%';
