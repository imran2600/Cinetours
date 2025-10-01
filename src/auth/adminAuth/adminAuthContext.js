// FileName: /src/auth/adminAuth/adminAuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://qunatum-tour.onrender.com'; // Your backend base URL (set in .env file for production)

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    // Check localStorage for persisted admin login state on app load
    const savedAdmin = localStorage.getItem('admin');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  // Function to handle admin login - calls POST /api/admin/auth/admin/login
  const login = async (email, password) => {
    // --- START MOCK LOGIN FOR TESTING ---
    // TODO: Remove this block when integrating with a real backend.
    // This is for temporary testing purposes only.
    if (email === 'admin@example.com' && password === 'password123') {
      const adminData = { email, token: 'mock-admin-token', refreshToken: 'mock-admin-refresh-token' };
      setAdmin(adminData);
      localStorage.setItem('admin', JSON.stringify(adminData));
      return { success: true };
    }
    // --- END MOCK LOGIN FOR TESTING ---

    try {
      const response = await fetch(`${BASE_URL}/api/admin/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming backend returns { token: "jwt-token", refresh_token: "refresh-token", ... }
        const adminData = { email, token: data.token, refreshToken: data.refresh_token }; // Store refresh token if provided
        setAdmin(adminData);
        localStorage.setItem('admin', JSON.stringify(adminData));
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      return { success: false, message: 'Network error or server is unreachable.' };
    }
  };

  // Function to handle admin registration - calls POST /api/admin/auth/admin/register
  const register = async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/auth/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming backend returns { token: "jwt-token", refresh_token: "refresh-token", message: "Success" }
        const adminData = { email, token: data.token, refreshToken: data.refresh_token }; // Store refresh token if provided
        setAdmin(adminData);
        localStorage.setItem('admin', JSON.stringify(adminData));
        return { success: true, message: data.message || 'Registration successful' };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Admin registration failed:', error);
      return { success: false, message: 'Network error or server is unreachable. Please check your connection.' };
    }
  };

  // Function to refresh the access token - calls POST /api/admin/auth/admin/refresh
  const refresh = async () => {
    try {
      const adminData = JSON.parse(localStorage.getItem('admin'));
      const refreshToken = adminData?.refreshToken; // Assuming refresh token is stored here

      if (!refreshToken) {
        console.warn('No refresh token found for admin.');
        setAdmin(null); // Clear admin state if no refresh token
        localStorage.removeItem('admin');
        return false;
      }

      const response = await fetch(`${BASE_URL}/api/admin/auth/admin/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Often, refresh tokens are sent in the body or as an HTTP-only cookie.
          // If your backend expects it in the Authorization header, adjust here.
          'Authorization': `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }), // Some backends expect it in the body
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming backend returns { token: "new-jwt-token", refresh_token: "new-refresh-token", ... }
        const newAdminData = { ...adminData, token: data.token, refreshToken: data.refresh_token || refreshToken };
        setAdmin(newAdminData);
        localStorage.setItem('admin', JSON.stringify(newAdminData));
        return true;
      } else {
        console.error('Admin token refresh failed:', data.message || 'Unknown error');
        setAdmin(null); // Clear admin state on refresh failure (e.g., refresh token expired)
        localStorage.removeItem('admin');
        return false;
      }
    } catch (error) {
      console.error('Admin token refresh network error:', error);
      setAdmin(null); // Clear admin state on network error
      localStorage.removeItem('admin');
      return false;
    }
  };

  // Function to handle admin logout - calls POST /api/admin/auth/admin/logout
  const logout = async () => {
    try {
      const adminData = JSON.parse(localStorage.getItem('admin'));
      const token = adminData?.token;

      if (token) {
        await fetch(`${BASE_URL}/api/admin/auth/admin/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Admin logout failed on backend:', error);
    } finally {
      setAdmin(null);
      localStorage.removeItem('admin');
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, register, logout, refresh }}>
      {children}
    </AdminAuthContext.Provider>
  );
};