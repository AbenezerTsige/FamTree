import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthHeaders } from '../context/AuthContext';
import './Settings.css';

const apiUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

export default function Settings() {
  const { username } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail || 'Failed to change password');
        return;
      }
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-card">
        <Link to="/" className="settings-back">← Back to Dashboard</Link>
        <h1>Settings</h1>
        <p className="settings-user">Logged in as <strong>{username}</strong></p>
        <section className="settings-section">
          <h2>Change password</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="current">Current password</label>
              <input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="new">New password</label>
              <input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm">Confirm new password</label>
              <input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            {error && <div className="settings-error">{error}</div>}
            {message && <div className="settings-message">{message}</div>}
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
