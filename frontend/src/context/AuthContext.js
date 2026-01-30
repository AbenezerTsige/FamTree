import React, { createContext, useContext, useState, useEffect } from 'react';

const TOKEN_KEY = 'famtree_token';
const USER_KEY = 'famtree_username';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState(() => localStorage.getItem(USER_KEY));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const login = (accessToken, name) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, name || '');
    setToken(accessToken);
    setUsername(name || '');
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUsername(null);
  };

  const isAuthenticated = !!token;

  const value = {
    token,
    username,
    isAuthenticated,
    login,
    logout,
    ready,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}
