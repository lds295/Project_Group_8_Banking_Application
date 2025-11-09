import React, { useState, useEffect } from "react";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);

  // Pretend this is coming from your backend
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        type: "Checking",
        number: "**** 2451",
        balance: 1542.73,
        transactions: [
       
        ]
      },
      {
        id: 2,
        type: "Savings",
        number: "**** 9832",
        balance: 6600.00,
        transactions: [
          
        ]
      }
    ];

    setAccounts(mockData);
  }, []);

  return (
    <div style={styles.container}>
      <h2>Your Accounts</h2>

      {accounts.map((acc) => (
        <div key={acc.id} style={styles.accountCard}>
          <h3>{acc.type} Account</h3>
          <p style={styles.accountNumber}>{acc.number}</p>
          <p style={styles.balance}>${acc.balance.toFixed(2)}</p>

          <h4>Recent Transactions</h4>
          <ul style={styles.list}>
            {acc.transactions.map((tx) => (
              <li key={tx.id} style={styles.transaction}>
                <span>{tx.date} — {tx.description}</span>
                <span style={{ color: tx.amount < 0 ? "red" : "green" }}>
                  {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial"
  },
  accountCard: {
    border: "1px solid #ddd",
    padding: "20px",
    marginBottom: "25px",
    borderRadius: "10px"
  },
  accountNumber: {
    color: "#777",
    margin: "3px 0"
  },
  balance: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "6px 0"
  },
  list: {
    listStyle: "none",
    padding: 0
  },
  transaction: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #eee"
  }
};
