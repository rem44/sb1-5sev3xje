import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ClaimDetails from './pages/ClaimDetails';
import CreateClaim from './pages/CreateClaim';
import { ClaimsProvider } from './context/ClaimsContext';

function App() {
  return (
    <ClaimsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="claims/:id" element={<ClaimDetails />} />
            <Route path="claims/new" element={<CreateClaim />} />
          </Route>
        </Routes>
      </Router>
    </ClaimsProvider>
  );
}

export default App;