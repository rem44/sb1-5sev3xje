// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ClaimDetails from './pages/ClaimDetails';
import CreateClaim from './pages/CreateClaim';
import Login from './pages/Login';
import { ClaimsProvider } from './context/ClaimsContext';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/auth/RequireAuth';

function App() {
  return (
    <AuthProvider>
      <ClaimsProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              {/* More specific routes MUST come before general ones */}
              <Route path="claims/create" element={<CreateClaim />} />
              <Route path="claims/:id" element={<ClaimDetails />} />
              {/* Add error boundary for non-existent routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </ClaimsProvider>
    </AuthProvider>
  );
}

export default App;
