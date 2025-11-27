// src/App.jsx (UPDATED with Registration and Setup Routes)

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';      
import RegistrationForm from './components/RegistrationForm.jsx'; // 🆕 FIXED: Import the Registration Form
import Dashboard from './components/Dashboard.jsx'; 
import ProtectedRoute from './components/ProtectedRoute.jsx'; 
import ProfileSetup from './components/ProfileSetup.jsx'; // Import the Profile Setup component

function App() {
  return (
    <Routes>
      
      {/* 1. Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegistrationForm />} /> {/* NEW REGISTER ROUTE */}
      
      {/* 2. Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
          
          {/* Default Route: Redirects to Dashboard if logged in */}
          <Route path="/" element={<Dashboard />} /> 
          
          {/* Main Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Profile Setup Route: The destination after successful registration */}
          <Route path="/setup-profile" element={<ProfileSetup />} /> 
          
          {/* Future Routes */}
          {/* <Route path="/profile" element={<Profile />} /> */}
          {/* <Route path="/workout-view" element={<WorkoutView3D />} /> */}

      </Route>
      
      {/* 3. Catch-all for unknown routes */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;