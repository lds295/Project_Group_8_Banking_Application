import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "./loginsignup.css"; // <--- ADD THIS IMPORT

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
   username: "",
   phone_number: '',
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
      const res = await api.signup(
       { username: formData.username, email: formData.email, password: formData.password, phone_number: formData.phone_number }, 
         "/auth/register" 
       );

      if (!res.ok) {
        const message = res.data && res.data.message ? res.data.message : "Registration failed";
        return setError(message);
      }

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="title">Register</h2>
      <form onSubmit={handleSubmit} className="form-column">
        <input
          type="text"
          name="username"
          placeholder="Full Name"
          value={formData.username}
          onChange={handleChange}
          className="form-input"
          required
        />
        <input
          type="tel"
          name="phone_number"
          placeholder="Phone Number (Optional)"
          value={formData.phone_number}
          onChange={handleChange}
          className="form-input"
          />

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

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="form-input"
          required
        />

        {error && <div className="error-msg">{error}</div>}

        <button type="submit" className="btn btn-success">
          Register
        </button>

        <p style={{ marginTop: "20px", textAlign: "center"}}>
            Already have an account?{" "}
            <Link to="/login" className="link-text">
              Login Here
            </Link>
        </p>
      </form>
    </div>
  );
}