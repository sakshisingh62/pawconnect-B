import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // Expect a user object with a token property
  if (user && user.token) {
    return children;
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;