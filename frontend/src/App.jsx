/**
 * PHOTOMEMORY PRO - CLIENT-SIDE ROUTER
 * ---------------------------------------------------------
 * PURPOSE: Manages navigation and enforces authentication boundaries.
 * PATTERN: Protected Routes (Guard Pattern) to shield sensitive views.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page Imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Gallery from './pages/Gallery';
import PhotographerDashboard from './pages/PhotographerDashboard';

/**
 * PROTECTED ROUTE GUARD
 * ---------------------------------------------------------
 * Checks for the existence of the JWT 'token' in localStorage.
 * If missing, it redirects the entity to the Login gateway.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. PUBLIC GATEWAY */}
        <Route path="/" element={<Home />} />
        
        {/* 2. AUTHENTICATION ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 3. OPERATOR CONSOLE
            In a real-world scenario, you might want to protect this 
            with an 'admin' token check as well.
        */}
        <Route path="/upload" element={<PhotographerDashboard />} />

        {/* 4. PROTECTED GUEST GALLERY
            Only accessible if a biometric identity (JWT) is established.
        */}
        <Route 
          path="/gallery" 
          element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          } 
        />

        {/* 5. CATCH-ALL REDIRECT
            Ensures users don't get lost on 404 paths.
        */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
