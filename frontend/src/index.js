import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import App from './App';
import Login from './components/Login';
import Settings from './components/Settings';

function ProtectedRoute({ children }) {
  const { isAuthenticated, ready } = useAuth();
  if (!ready) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: window.location.pathname } }} replace />;
  }
  return children;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
