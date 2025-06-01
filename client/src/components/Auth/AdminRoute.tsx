import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};

export default AdminRoute;
