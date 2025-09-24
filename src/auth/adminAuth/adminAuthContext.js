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

  // Function to handle admin login - calls POST /api/admin/login
  const login = async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming backend returns { token: "jwt-token", ... }
        const adminData = { email, token: data.token };
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

  // Function to handle admin registration - calls POST /api/admin/register (THIS IS WHERE THE ENDPOINT IS CALLED)
  const register = async (email, password) => {
    try {
      // Prepare the request to your backend endpoint
      const response = await fetch(`${BASE_URL}/api/admin/register`, {
        method: 'POST',  // HTTP method for creating new resources
        headers: {
          'Content-Type': 'application/json',  // Tell backend the body is JSON
        },
        body: JSON.stringify({ email, password }),  // Send user data as JSON payload
      });

      // Parse the backend's JSON response
      const data = await response.json();

      if (response.ok) {  // Success (HTTP 200/201)
        // Assuming backend returns { token: "jwt-token", message: "Success" }
        // Store admin data locally for auto-login
        const adminData = { email, token: data.token };
        setAdmin(adminData);
        localStorage.setItem('admin', JSON.stringify(adminData));
        return { success: true, message: data.message || 'Registration successful' };
      } else {  // Failure (HTTP 400/500, etc.)
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      // Handle network errors (e.g., server down, no internet)
      console.error('Admin registration failed:', error);
      return { success: false, message: 'Network error or server is unreachable. Please check your connection.' };
    }
  };

  // Function to handle admin logout - calls POST /api/admin/logout
  const logout = async () => {
    try {
      // Get stored token for backend validation
      const adminData = JSON.parse(localStorage.getItem('admin'));
      const token = adminData?.token;

      if (token) {
        // Send request to invalidate session on backend
        await fetch(`${BASE_URL}/api/admin/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Send token in header for backend to verify/invalidate
          },
        });
      }
      // Clear local state even if API fails (for better UX)
    } catch (error) {
      console.error('Admin logout failed on backend:', error);
    } finally {
      // Always clear frontend state
      setAdmin(null);
      localStorage.removeItem('admin');
    }
  };

  // Provide the context value to child components
  return (
    <AdminAuthContext.Provider value={{ admin, login, register, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};