// src/App.tsx - Assurer l'ordre correct des routes
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
              {/* IMPORTANT: Route spécifique AVANT la route paramétrique */}
              <Route path="claims/new" element={<CreateClaim />} />
              <Route path="claims/:id" element={<ClaimDetails />} />
            </Route>
          </Routes>
        </Router>
      </ClaimsProvider>
    </AuthProvider>
  );
}
