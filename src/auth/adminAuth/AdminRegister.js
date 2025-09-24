// FileName: /src/auth/adminAuth/AdminRegister.js
import React, { useState } from "react";
import { useAdminAuth } from "./adminAuthContext"; // Import from same folder (adjust if filename differs)
import { useNavigate, Link } from "react-router-dom";
import "./AdminLogin.css"; // Reuse existing CSS

const AdminRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const result = await register(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/admin"); // Redirect to admin dashboard
    } else {
      setError(result.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Admin Register</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email" className="auth-label">
            Email address
          </label>
          <input
            type="email"
            id="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter admin email"
            disabled={loading}
          />

          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password (min 6 chars)"
            disabled={loading}
          />

          <label htmlFor="confirmPassword" className="auth-label">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm password"
            disabled={loading}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="auth-footer-text">
          Already have an admin account?{" "}
          <Link to="/admin-login" className="auth-link">
            Sign In
          </Link>
        </p>
        <p className="auth-footer-text">
          <Link to="/admin-login" className="auth-link">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister; // Ensure this default export is present