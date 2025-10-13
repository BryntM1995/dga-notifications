// src/router/RequireAuth.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth'; // 👈 ya lo tienes separado

const RequireAuth: React.FC = () => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />; // si hay token, deja pasar a las rutas hijas
};

export default RequireAuth;
