import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return setError("Please fill out all fields");
    }

    setError("");
    try {
      const res = await api.login({ email: formData.email, password: formData.password }, "/auth/login");

      if (!res.ok) {
        const message = res.data && res.data.message ? res.data.message : "Login failed";
        return setError(message);
      }

      const user = (res.data && res.data.user) ? res.data.user : { email: formData.email };

      if (onLogin) onLogin(user);

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
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

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "380px",
    margin: "60px auto",
    border: "1px solid #ddd",
    padding: "25px",
    borderRadius: "10px",
    fontFamily: "Arial"
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  input: {
    padding: "10px",
    margin: "8px 0",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  button: {
    padding: "10px",
    marginTop: "10px",
    cursor: "pointer",
    borderRadius: "6px",
    border: "none",
    background: "#007bff",
    color: "#fff",
    fontWeight: "bold"
  }
};
