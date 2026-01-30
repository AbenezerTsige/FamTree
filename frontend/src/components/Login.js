import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const apiUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    navigate(from || '/', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? `${apiUrl}/api/auth/register` : `${apiUrl}/api/auth/login`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail || (isRegister ? 'Registration failed' : 'Login failed'));
        return;
      }
      login(data.access_token, data.username);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Family Tree</h1>
        <h2>{isRegister ? 'Create account' : 'Sign in'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Register' : 'Sign in')}
          </button>
        </form>
        <button
          type="button"
          className="btn-toggle"
          onClick={() => {
            setIsRegister((v) => !v);
            setError('');
          }}
        >
          {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}
