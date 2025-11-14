import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
   username: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      // Adjust endpoint as needed for your backend.
      const res = await api.signup(
       { username: formData.username, email: formData.email, password: formData.password }, 
         "/auth/register" 
       );

      if (!res.ok) {
        const message = res.data && res.data.message ? res.data.message : "Registration failed";
        return setError(message);
      }

      // Redirect to login after successful registration
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="username"
          placeholder="Full Name"
          value={formData.username}
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
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Login Here
            </Link>
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
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold"
  }
};
