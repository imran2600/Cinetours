// FileName: /src/auth/adminAuth/AdminLogin.js
import React, { useState } from "react";
import { useAdminAuth } from "./adminAuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./AdminLogin.css"; // We'll create this CSS file to match client SignIn styles

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Set loading to true on submission
    const result = await login(email, password);
    setLoading(false); // Set loading to false after response
    if (result.success) {
      navigate("/admin");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Admin Sign In</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email" className="auth-label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your admin email"
            disabled={loading} // Disable input during loading
          />

          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            disabled={loading} // Disable input during loading
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <p className="auth-footer-text">
          Don't have an admin account?{" "}
          <Link to="/admin-register" className="auth-link">
            Register
          </Link>
        </p>
        <p className="auth-footer-text">
          Not an admin?{" "}
          <Link to="/" className="auth-link">
            Go back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;