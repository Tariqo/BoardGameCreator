import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // Or a spinner

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
