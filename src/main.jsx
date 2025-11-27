// src/main.jsx (FINAL CORRECTED VERSION)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 1. Import Router
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // 2. Import AuthProvider
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. BrowserRouter must wrap the entire application */}
    <BrowserRouter>
      {/* 2. AuthProvider must wrap the App to give it access to context */}
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);