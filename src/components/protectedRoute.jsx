// src/components/ProtectedRoute.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * A wrapper component that checks for authentication.
 * If the user is logged in, it renders the child route's component via <Outlet />.
 * If not logged in, it redirects the user to the /login page.
 */
const ProtectedRoute = () => {
  // Use the custom hook to get the authentication state
  const { isLoggedIn, isLoading } = useAuth();
  
  // Optional: You could show a loading screen while the token check happens.
  if (isLoading) {
    return <div>Verifying authentication...</div>;
  }

  // If the user is logged in, render the nested component (e.g., Dashboard)
  if (isLoggedIn) {
    // <Outlet /> renders the child <Route> element from App.jsx
    return <Outlet />; 
  }
  
  // If the user is NOT logged in, redirect them to the login page.
  // The 'replace' prop ensures the user can't navigate back to the protected route.
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;