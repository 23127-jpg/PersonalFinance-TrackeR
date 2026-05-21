import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Support from './pages/Support';
import Dashboard from './pages/Dashboard';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#ffd700', marginBottom: '20px' }}></i>
        <h2>Synchronizing user profile...</h2>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Redirect Authenticated Route Guard (Prevents logged-in users from seeing login/signup pages)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#ffd700', marginBottom: '20px' }}></i>
        <h2>Synchronizing user profile...</h2>
      </div>
    );
  }

  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            
            <div style={{ flex: '1' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <PublicRoute>
                      <SignUp />
                    </PublicRoute>
                  } 
                />
                <Route path="/support" element={<Support />} />
                
                {/* Protected Dashboard Route */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback routing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
