// FileName: /src/auth/adminAuth/adminPrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './adminAuthContext';

const AdminPrivateRoute = ({ children }) => {
  const { admin } = useAdminAuth();

  if (!admin) {
    // Not logged in, redirect to admin login page
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminPrivateRoute;