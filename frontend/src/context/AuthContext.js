import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'famtree_token';
const USER_KEY = 'famtree_username';
const API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState(() => localStorage.getItem(USER_KEY));
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  const fetchMe = useCallback(async (authToken) => {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username || '');
        setIsAdmin(!!data.is_admin);
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchMe(token).then(() => setReady(true));
    } else {
      setIsAdmin(false);
      setReady(true);
    }
  }, [token, fetchMe]);

  const login = (accessToken, name) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, name || '');
    setToken(accessToken);
    setUsername(name || '');
    fetchMe(accessToken);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUsername(null);
    setIsAdmin(false);
  };

  const isAuthenticated = !!token;

  const value = {
    token,
    username,
    isAdmin,
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
