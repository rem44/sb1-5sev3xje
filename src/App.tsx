// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ClaimDetails from './pages/ClaimDetails';
import CreateClaim from './pages/CreateClaim';
import Login from './pages/Login';
import { ClaimsProvider } from './context/ClaimsContext';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/auth/RequireAuth';
import ChatInterface from './components/chat/ChatInterface';

function App() {
  return (
    <AuthProvider>
      <ClaimsProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }>
              <Route index element={<Dashboard />} />
              {/* Important: Route spécifique AVANT la route paramétrique */}
              <Route path="claims/new" element={<CreateClaim />} />
              <Route path="claims/:id" element={<ClaimDetails />} />
            </Route>
          </Routes>
        </Router>
        <ChatInterface />
      </ClaimsProvider>
    </AuthProvider>
  );
}

// ✅ Ajoutez cet export par défaut
export default App;
