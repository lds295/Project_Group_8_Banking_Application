import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return setError("Please fill out all fields");
    }

    console.log("User trying to login:", formData);

 
    navigate("/dashboard");
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

      <p style={{ marginTop: "12px" }}>
        Don't have an account?{" "}
        <Link to="/register" style={styles.link}>
          Sign up here
        </Link>
      </p>
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
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold"
  }
};
