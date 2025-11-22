import React, { useState } from "react";

export default function SendMoneyPage() {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    setMessage("");
    setSearchResult(null);

    try {
      const res = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.user) {
        setSearchResult(data.user);
      } else {
        setMessage("No user found.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error searching user.");
    }
  };

  const handleSendMoney = async () => {
    setMessage("");

    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: searchResult.id,
          amount: Number(amount)
        })
      });

      const data = await res.json();

      if (res.ok) setMessage("Money sent successfully!");
      else setMessage(data.error || "Transfer failed.");
    } catch (err) {
      console.error(err);
      setMessage("Error sending money.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Send Money</h2>

      <div style={styles.card}>
        <h3>Search User</h3>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter phone number or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button style={styles.button} onClick={handleSearch}>Search</button>
      </div>

      {searchResult && (
        <div style={styles.card}>
          <h3>User Found</h3>
          <p><strong>Name:</strong> {searchResult.name}</p>
          <p><strong>Email:</strong> {searchResult.email}</p>
          <p><strong>Phone:</strong> {searchResult.phone}</p>

          <input
            style={styles.input}
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button style={styles.sendButton} onClick={handleSendMoney}>
            Send Money
          </button>
        </div>
      )}

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial"
  },
  card: {
    background: "#f4f4f4",
    padding: "15px",
    marginTop: "20px",
    borderRadius: "10px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  button: {
    marginTop: "10px",
    padding: "10px 15px",
    background: "#0077ff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  sendButton: {
    marginTop: "10px",
    padding: "10px 15px",
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  message: {
    marginTop: "20px",
    fontWeight: "bold"
  }
};
