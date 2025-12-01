import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "./loginsignup.css"; // <--- ADD THIS IMPORT

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
    <div className="auth-container">
      <h2 className="title">Login</h2>

      <form onSubmit={handleSubmit} className="form-column">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="form-input"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="form-input"
          required
        />

        {error && <div className="error-msg">{error}</div>}

        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Don't Have an Account?{" "}
        <Link to="/signup" className="link-text">
          Sign up Here
        </Link> 
      </p>
    </div>
  );
}