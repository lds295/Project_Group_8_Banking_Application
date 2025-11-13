import React, { useState } from "react";
import './loginsignup.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

   
    console.log("User registered:", formData);
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          style={styles.input}
          required
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" style={styles.button}>
          Register
        </button>
        <p style={{ marginTop: "12px"}}>
            Already have an account?{""}
            <link to="/login" style={styles.link}>
            Login Here </link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    border: "1px solid #ddd",
    padding: "20px",
    borderRadius: "8px",
    fontFamily: "Arial"
  },
  form: { display: "flex", flexDirection: "column" },
  input: {
    padding: "10px",
    margin: "8px 0",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  button: {
    padding: "10px",
    marginTop: "10px",
    cursor: "pointer",
    borderRadius: "5px",
    border: "none",
    background: "#4CAF50",
    color: "#fff",
    fontWeight: "bold"
  }
};

