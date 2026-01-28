import React, { useState, useEffect } from 'react';
import './FamilyMembers.css';

const FamilyMembers = ({ onMemberChange }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    birth_date: '',
    gender: 'male',
    parent_id: '',
    color: '#4a90e2'  // Default color
  });

  const apiUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/persons`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        last_name: '', // Set empty string for last_name
        parent_id: formData.parent_id && formData.parent_id !== 'none' ? parseInt(formData.parent_id) : null
      };

      if (editingId) {
        // Update existing member
        const response = await fetch(`${apiUrl}/api/persons/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
        if (!response.ok) throw new Error('Failed to update member');
      } else {
        // Create new member
        const response = await fetch(`${apiUrl}/api/persons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
        if (!response.ok) throw new Error('Failed to create member');
      }

      resetForm();
      await fetchMembers();
      if (onMemberChange) onMemberChange();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setFormData({
      first_name: member.first_name,
      birth_date: member.birth_date,
      gender: member.gender,
      parent_id: member.parent_id || '',
      color: member.color || '#4a90e2'
    });
  };

  const handleDelete = async (id) => {
    const member = members.find(m => m.id === id);
    const memberName = member ? (member.last_name ? `${member.first_name} ${member.last_name}` : member.first_name) : 'this member';
    
    if (!window.confirm(`Are you sure you want to delete ${memberName}? This will also delete all their descendants.`)) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${apiUrl}/api/persons/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete member');
      }
      
      // Refresh the members list to reflect the deletion
      await fetchMembers();
      
      // Update the dashboard to reflect changes
      if (onMemberChange) {
        onMemberChange();
      }
    } catch (err) {
      setError(err.message);
      console.error('Delete error:', err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      first_name: '',
      birth_date: '',
      gender: 'male',
      parent_id: '',
      color: '#4a90e2'
    });
  };

  const getMemberName = (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return 'Unknown';
    return member.last_name ? `${member.first_name} ${member.last_name}` : member.first_name;
  };

  if (loading) {
    return <div className="loading">Loading family members...</div>;
  }

  return (
    <div className="family-members">
      <div className="members-header">
        <h2>{editingId ? 'Edit Family Member' : 'Add New Family Member'}</h2>
        <div className="header-actions">
          <button className="btn-update" onClick={onMemberChange} title="Update Dashboard">
            Update Dashboard
          </button>
          {editingId && (
            <button className="btn-cancel" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="member-form">
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Parent *</label>
            <select
              value={formData.parent_id || 'none'}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value === 'none' ? '' : e.target.value })}
              required
            >
              <option value="none">None (Root/Founder)</option>
              {members
                .filter(m => !editingId || m.id !== editingId)
                .map(member => (
                  <option key={member.id} value={member.id}>
                    {member.last_name ? `${member.first_name} ${member.last_name}` : member.first_name} ({new Date(member.birth_date).getFullYear()})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Birth Date *</label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Gender *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Color</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="color-picker"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#4a90e2"
                className="color-input"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-submit">
          {editingId ? 'Update Member' : 'Add Member'}
        </button>
      </form>

      <div className="members-list">
        <h2>All Family Members ({members.length})</h2>
        <div className="members-table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Birth Date</th>
                <th>Gender</th>
                <th>Parent</th>
                <th>Color</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">No family members found</td>
                </tr>
              ) : (
                members.map(member => (
                  <tr key={member.id}>
                    <td>{member.id}</td>
                    <td>{member.last_name ? `${member.first_name} ${member.last_name}` : member.first_name}</td>
                    <td>{new Date(member.birth_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`gender-badge gender-${member.gender}`}>
                        {member.gender}
                      </span>
                    </td>
                    <td>
                      {member.parent_id ? getMemberName(member.parent_id) : '—'}
                    </td>
                    <td>
                      <div className="color-display">
                        <div 
                          className="color-swatch" 
                          style={{ backgroundColor: member.color || '#4a90e2' }}
                          title={member.color || '#4a90e2'}
                        ></div>
                        <span className="color-code">{member.color || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(member)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(member.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FamilyMembers;
