import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuthHeaders } from '../context/AuthContext';
import './Admin.css';

const apiUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/admin/users`, { headers: getAuthHeaders() });
      if (res.status === 403) {
        setError('Admin only');
        setUsers([]);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createUsername.trim() || !createPassword.trim()) {
      setCreateMessage('Username and password required');
      return;
    }
    setCreating(true);
    setCreateMessage(null);
    try {
      const res = await fetch(`${apiUrl}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ username: createUsername.trim(), password: createPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateMessage(data.detail || 'Failed to create user');
        return;
      }
      setCreateUsername('');
      setCreatePassword('');
      setCreateMessage('User created. They can log in and build their own family tree.');
      fetchUsers();
    } catch (err) {
      setCreateMessage(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>User accounts</h1>
        <Link to="/" className="btn-back">Back to Dashboard</Link>
      </div>

      <p className="admin-intro">
        As admin you can create new user accounts. Each user has their own family tree; they only see and edit their own data.
      </p>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-create">
        <h2>Create new account</h2>
        <form onSubmit={handleCreateUser} className="admin-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={createUsername}
              onChange={(e) => setCreateUsername(e.target.value)}
              placeholder="username"
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder="password"
            />
          </div>
          <button type="submit" className="btn-create" disabled={creating}>
            {creating ? 'Creating…' : 'Create user'}
          </button>
          {createMessage && <p className="create-message">{createMessage}</p>}
        </form>
      </section>

      <section className="admin-list">
        <h2>All users</h2>
        {loading ? (
          <p className="loading">Loading users…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="3" className="no-data">No users</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.is_admin ? 'Yes' : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Admin;
