// src/components/ProtectedRoute.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * A wrapper component that checks for authentication and onboarding status.
 * - Not logged in → /login
 * - Logged in but profile not set up → /setup-profile (first, before dashboard)
 * - Logged in + profile complete → renders the child route
 */
const ProtectedRoute = () => {
  const { isLoggedIn, isLoading, profileComplete } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1121', color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>
        Verifying authentication...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/fit/login" replace />;
  }

  // Onboarding gate: force profile setup as the first stop for incomplete profiles.
  const isSetupPath = location.pathname === '/fit/setup-profile';
  if (profileComplete === false && !isSetupPath) {
    return <Navigate to="/fit/setup-profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;