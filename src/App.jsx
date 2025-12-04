import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import RegistrationForm from './components/RegistrationForm';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileSetup from './components/ProfileSetup';
// 👇 NEW: Import the Admin Dashboard
import AdminDashboard from './components/AdminDashboard';

const GlobalStyles = () => (
  <style>{`
    /* Force Transparent Backgrounds on EVERYTHING */
    * {
      background-color: transparent !important;
    }
    
    /* Re-apply backgrounds ONLY where we want them */
    body {
      background-color: #0b1121 !important; /* Updated Navy */
    }
    
    /* Restoring card backgrounds */
    .comparison-card {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }
    .comparison-card.good {
      background-color: rgba(255, 215, 0, 0.05) !important;
    }
    .engine-card, .cta-card, .auth-card {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }
    
    /* Inputs & Buttons */
    button {
      background-color: #FFD700 !important;
    }
    nav button {
      background-color: white !important;
    }
    input, select {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
  `}</style>
);

function App() {
  return (
    <Router>
      <AuthProvider>
          <GlobalStyles />
          
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegistrationForm />} />
            
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/setup-profile" element={<ProfileSetup />} />
                
                {/* 👇 THIS IS THE MISSING LINE! */}
                <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            
            <Route path="*" element={<h1 style={{color: 'white', textAlign: 'center', marginTop: '100px'}}>404 Not Found</h1>} />
          </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;